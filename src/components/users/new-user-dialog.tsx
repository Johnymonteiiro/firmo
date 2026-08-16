"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
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
  createUserSchema,
  USER_PROFILE_LABELS,
  USER_PROFILES,
  USER_STATUS_LABELS,
  USER_STATUSES,
  useCreateUser,
  type CreateUserFormValues,
} from "@/lib/users"
import { INSTITUTIONAL_DOMAIN } from "@/lib/validation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

const EMPTY_FORM: CreateUserFormValues = {
  name: "",
  email: "",
  profile: "SERVIDOR",
  status: "ATIVO",
}

export function NewUserDialog() {
  const [open, setOpen] = React.useState(false)
  const createUser = useCreateUser()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: standardSchemaResolver(createUserSchema),
    defaultValues: EMPTY_FORM,
  })

  function onSubmit(values: CreateUserFormValues) {
    createUser.mutate(
      { ...values, email: values.email.trim().toLowerCase() },
      {
        onSuccess: () => {
          reset(EMPTY_FORM)
          setOpen(false)
        },
      }
    )
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      reset(EMPTY_FORM)
      createUser.reset()
    }
  }

  const errorMessage =
    createUser.error instanceof ApiError
      ? createUser.error.message
      : createUser.error
        ? "Não foi possível salvar o usuário."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Novo Usuário"
      formId="new-user-form"
      onSubmit={handleSubmit(onSubmit)}
      isPending={createUser.isPending}
      errorMessage={errorMessage}
      contentClassName="h-auto w-150"
      trigger={
        <Button size="sm" className="gap-2">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          Novo Usuário
        </Button>
      }
    >
      <SectionTitle>Identificação</SectionTitle>
      <Field label="Nome" error={errors.name?.message} className="col-span-2">
        <Input
          placeholder="Nome completo"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </Field>

      <Field
        label="E-mail institucional"
        error={errors.email?.message}
        className="col-span-2"
      >
        <Input
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder={`nome.sobrenome@${INSTITUTIONAL_DOMAIN}`}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
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

      <Field label="Status inicial" error={errors.status?.message}>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.status}>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {USER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {USER_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
    </FormDialog>
  )
}
