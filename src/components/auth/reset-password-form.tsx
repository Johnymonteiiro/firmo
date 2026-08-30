"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  MIN_PASSWORD_LENGTH,
  resetPasswordSchema,
  useResetPassword,
  type ResetPasswordFormValues,
} from "@/lib/auth"

const EMPTY: ResetPasswordFormValues = {
  newPassword: "",
  confirmPassword: "",
}

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reset = useResetPassword()
  const [formError, setFormError] = React.useState<string | null>(null)

  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: EMPTY,
  })

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-sm">
        <p className="text-destructive">
          Link inválido: o endereço não traz o token de redefinição.
        </p>
        <Button asChild variant="outline">
          <Link href="/forgot-password">Pedir um novo link</Link>
        </Button>
      </div>
    )
  }

  function onSubmit(values: ResetPasswordFormValues) {
    setFormError(null)
    reset.mutate(
      { token: token as string, newPassword: values.newPassword },
      {
        onSuccess: () => router.replace("/login?redefinida=1"),
        onError: (error) => {
          setFormError(
            error instanceof ApiError
              ? error.message
              : "Não foi possível redefinir a senha."
          )
        },
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-4"
      noValidate
    >
      <Field label="Nova senha" error={errors.newPassword?.message}>
        <Input
          type="password"
          autoComplete="new-password"
          autoFocus
          {...register("newPassword")}
        />
      </Field>

      <Field
        label="Confirmar nova senha"
        error={errors.confirmPassword?.message}
      >
        <Input
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
      </Field>

      <p className="text-xs text-muted-foreground">
        Mínimo de {MIN_PASSWORD_LENGTH} caracteres. O link vale por 30 minutos e
        só pode ser usado uma vez.
      </p>

      {formError ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={reset.isPending}>
        {reset.isPending ? "Salvando…" : "Redefinir senha"}
      </Button>
    </form>
  )
}
