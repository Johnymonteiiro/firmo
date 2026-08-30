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

/**
 * Primeiro acesso: o convite do administrador traz um token, e é aqui que o
 * usuário define a própria senha. Mesmo endpoint da redefinição — muda o
 * texto, porque quem chega aqui nunca teve senha.
 */
export function SetupPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const definir = useResetPassword()
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
          Link inválido: o endereço não traz o token do convite.
        </p>
        <Button asChild variant="outline">
          <Link href="/forgot-password">Receber um novo link</Link>
        </Button>
      </div>
    )
  }

  function onSubmit(values: ResetPasswordFormValues) {
    setFormError(null)
    definir.mutate(
      { token: token as string, newPassword: values.newPassword },
      {
        onSuccess: () => router.replace("/login?definida=1"),
        onError: (error) => {
          setFormError(
            error instanceof ApiError
              ? error.message
              : "Não foi possível definir a senha."
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
      <Field label="Senha" error={errors.newPassword?.message}>
        <Input
          type="password"
          autoComplete="new-password"
          autoFocus
          {...register("newPassword")}
        />
      </Field>

      <Field label="Confirmar senha" error={errors.confirmPassword?.message}>
        <Input
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
      </Field>

      <p className="text-xs text-muted-foreground">
        Mínimo de {MIN_PASSWORD_LENGTH} caracteres. O convite vale por 48 horas
        e só pode ser usado uma vez.
      </p>

      {formError ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={definir.isPending}>
        {definir.isPending ? "Salvando…" : "Definir senha e acessar"}
      </Button>
    </form>
  )
}
