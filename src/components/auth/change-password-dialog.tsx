"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Input } from "@/components/ui/input"
import { FormDialog } from "@/components/form/form-dialog"
import { Field } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  changePasswordSchema,
  MIN_PASSWORD_LENGTH,
  useChangePassword,
  type ChangePasswordFormValues,
} from "@/lib/auth"

const EMPTY: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

/**
 * Troca de senha do próprio usuário, em modal — não tira ninguém da tela em
 * que estava. O backend revoga todas as sessões ao trocar, então o desfecho é
 * sempre voltar ao login.
 */
export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const changePassword = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: standardSchemaResolver(changePasswordSchema),
    defaultValues: EMPTY,
  })

  function onSubmit(values: ChangePasswordFormValues) {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          reset(EMPTY)
          onOpenChange(false)
          router.replace("/login?changed=1")
        },
      }
    )
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      reset(EMPTY)
      changePassword.reset()
    }
  }

  const errorMessage =
    changePassword.error instanceof ApiError
      ? changePassword.error.message
      : changePassword.error
        ? "Não foi possível alterar a senha."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Alterar senha"
      formId="change-password-form"
      onSubmit={handleSubmit(onSubmit)}
      isPending={changePassword.isPending}
      errorMessage={errorMessage}
      submitLabel="Alterar senha"
      contentClassName="h-auto w-120"
    >
      <Field
        label="Senha atual"
        error={errors.currentPassword?.message}
        className="col-span-2"
      >
        <Input
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register("currentPassword")}
        />
      </Field>

      <Field
        label="Nova senha"
        error={errors.newPassword?.message}
        className="col-span-2"
      >
        <Input
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register("newPassword")}
        />
      </Field>

      <Field
        label="Confirmar nova senha"
        error={errors.confirmPassword?.message}
        className="col-span-2"
      >
        <Input
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
      </Field>

      <p className="col-span-2 text-xs text-muted-foreground">
        Mínimo de {MIN_PASSWORD_LENGTH} caracteres, sem repetir nenhuma das 5
        últimas. Ao alterar, todas as sessões são encerradas e você entra de
        novo.
      </p>
    </FormDialog>
  )
}
