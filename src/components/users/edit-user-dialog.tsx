"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Input } from "@/components/ui/input"
import { FormDialog } from "@/components/form/form-dialog"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ProfilesField, ProfilesReadonly } from "@/components/users/profiles-field"
import { ApiError } from "@/lib/api"
import {
  updateUserSchema,
  useUpdateUser,
  type UpdateUserFormValues,
  type User,
} from "@/lib/users"

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  canEditProfile = true,
  self = false,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Falso para quem não tem `usuarios:editar` (RN-U06). */
  canEditProfile?: boolean
  /**
   * Edição dos próprios dados: vai para `PATCH /users/me`, que exige apenas
   * `usuarios:editar_proprio`. Pela rota de terceiros o backend responderia
   * 403 a quem não administra.
   */
  self?: boolean
}) {
  const updateUser = useUpdateUser()

  const defaults = React.useMemo<UpdateUserFormValues>(
    () => ({ name: user.name, profiles: user.profiles }),
    [user.name, user.profiles]
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: standardSchemaResolver(updateUserSchema),
    defaultValues: defaults,
  })

  // Reabrir o dialog deve refletir os dados atuais do registro.
  React.useEffect(() => {
    if (open) reset(defaults)
  }, [open, defaults, reset])

  function onSubmit(values: UpdateUserFormValues) {
    // Sem permissão de perfil, o campo nem entra no PATCH: o backend recusa
    // (403) mesmo que o valor enviado seja o atual.
    const input = canEditProfile ? values : { name: values.name }

    updateUser.mutate(
      { userId: user.userId, input, self },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) updateUser.reset()
  }

  const errorMessage =
    updateUser.error instanceof ApiError
      ? updateUser.error.message
      : updateUser.error
        ? "Não foi possível salvar o usuário."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Editar Usuário"
      formId={`edit-user-form-${user.userId}`}
      onSubmit={handleSubmit(onSubmit)}
      isPending={updateUser.isPending}
      errorMessage={errorMessage}
      contentClassName="h-auto w-150"
    >
      <SectionTitle>Identificação</SectionTitle>
      <Field label="Nome" error={errors.name?.message} className="col-span-2">
        <Input
          placeholder="Nome completo"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </Field>

      {/* E-mail é a identidade institucional do usuário — imutável no backend. */}
      <Field label="E-mail institucional" className="col-span-2">
        <Input value={user.email} readOnly disabled className="font-mono" />
      </Field>

      <SectionTitle>Acesso</SectionTitle>
      {/* Perfil é decisão de quem administra (RN-U06) — para os demais o
          campo aparece, para dar contexto, mas em leitura. */}
      <Field
        label="Perfis"
        error={errors.profiles?.message}
        className="col-span-2"
      >
        {canEditProfile ? (
          <Controller
            control={control}
            name="profiles"
            render={({ field }) => (
              <ProfilesField
                value={field.value}
                onChange={field.onChange}
                invalid={!!errors.profiles}
              />
            )}
          />
        ) : (
          <ProfilesReadonly profiles={user.profiles} />
        )}
      </Field>

      {/* Status tem rota própria (guarda anti-lockout) — via menu de ações. */}
      <Field label="Status">
        <Input value={user.status} readOnly disabled />
      </Field>
    </FormDialog>
  )
}
