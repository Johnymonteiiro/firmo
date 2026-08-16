"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormDialog } from "@/components/form/form-dialog"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  updateUserSchema,
  USER_PROFILE_LABELS,
  USER_PROFILES,
  useUpdateUser,
  type UpdateUserFormValues,
  type User,
} from "@/lib/users"

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateUser = useUpdateUser()

  const defaults = React.useMemo<UpdateUserFormValues>(
    () => ({ name: user.name, profile: user.profile }),
    [user.name, user.profile]
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
    updateUser.mutate(
      { userId: user.userId, input: values },
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
      <Field label="Perfil" error={errors.profile?.message}>
        <Controller
          control={control}
          name="profile"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.profile}>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                {USER_PROFILES.map((profile) => (
                  <SelectItem key={profile} value={profile}>
                    {USER_PROFILE_LABELS[profile]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      {/* Status tem rota própria (guarda anti-lockout) — via menu de ações. */}
      <Field label="Status">
        <Input value={user.status} readOnly disabled />
      </Field>
    </FormDialog>
  )
}
