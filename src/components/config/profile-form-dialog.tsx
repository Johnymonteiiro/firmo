"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { FormDialog } from "@/components/form/form-dialog"
import { Field } from "@/components/form/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api"
import {
  profileFormSchema,
  useCreateProfile,
  useDuplicateProfile,
  useUpdateProfile,
  type PermissionProfile,
  type ProfileFormValues,
} from "@/lib/config"

export type ProfileFormMode = "create" | "edit" | "duplicate"

const TITLE: Record<ProfileFormMode, string> = {
  create: "Novo perfil",
  edit: "Editar perfil",
  duplicate: "Duplicar perfil",
}

/**
 * Criar, editar e duplicar perfil (RF-C02). São o mesmo formulário: a
 * duplicação só pede o nome do novo perfil — a matriz vem copiada do original.
 */
export function ProfileFormDialog({
  mode,
  profile,
  open,
  onOpenChange,
  onCreated,
}: {
  mode: ProfileFormMode
  /** Perfil de origem — obrigatório em `edit` e `duplicate`. */
  profile?: PermissionProfile
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (profileId: string) => void
}) {
  const create = useCreateProfile()
  const update = useUpdateProfile()
  const duplicate = useDuplicateProfile()

  const mutation =
    mode === "create" ? create : mode === "edit" ? update : duplicate

  const defaults = React.useMemo<ProfileFormValues>(
    () =>
      mode === "edit" && profile
        ? { name: profile.name, description: profile.description ?? "" }
        : mode === "duplicate" && profile
          ? { name: `${profile.name} (cópia)`, description: "" }
          : { name: "", description: "" },
    [mode, profile]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: standardSchemaResolver(profileFormSchema),
    defaultValues: defaults,
  })

  React.useEffect(() => {
    if (open) reset(defaults)
  }, [open, defaults, reset])

  function onSubmit(values: ProfileFormValues) {
    const done = {
      onSuccess: (result: unknown) => {
        const id = (result as { profileId?: string } | undefined)?.profileId
        if (id) onCreated?.(id)
        onOpenChange(false)
      },
    }

    if (mode === "create") {
      create.mutate(values, done)
    } else if (mode === "edit" && profile) {
      update.mutate({ profileId: profile.profileId, input: values }, done)
    } else if (mode === "duplicate" && profile) {
      duplicate.mutate(
        { profileId: profile.profileId, name: values.name },
        done
      )
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Não foi possível salvar o perfil."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={TITLE[mode]}
      formId={`profile-form-${mode}-${profile?.profileId ?? "new"}`}
      onSubmit={handleSubmit(onSubmit)}
      isPending={mutation.isPending}
      errorMessage={errorMessage}
      contentClassName="h-auto w-140"
    >
      <Field label="Nome" error={errors.name?.message} className="col-span-2">
        <Input
          placeholder="Ex.: Fiscal de obras"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </Field>

      {mode === "duplicate" ? (
        <p className="col-span-2 text-xs text-muted-foreground">
          O novo perfil nasce com a mesma matriz de{" "}
          <span className="font-medium">{profile?.name}</span> e sem nenhum
          usuário vinculado.
        </p>
      ) : (
        <Field
          label="Descrição"
          error={errors.description?.message}
          className="col-span-2"
        >
          <Textarea
            rows={3}
            placeholder="Para que serve este perfil"
            aria-invalid={!!errors.description}
            {...register("description")}
          />
        </Field>
      )}
    </FormDialog>
  )
}
