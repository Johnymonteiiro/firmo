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
import { loginSchema, useLogin, type LoginFormValues } from "@/lib/auth"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useLogin()
  const [formError, setFormError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: LoginFormValues) {
    setFormError(null)
    login.mutate(
      { ...values, email: values.email.trim().toLowerCase() },
      {
        onSuccess: () => {
          // Entrou, entrou: nenhuma tela se interpõe. A senha provisória ou
          // vencida vem sinalizada em `nextAction`, mas quem decide quando
          // trocar é o usuário, pelo menu "Alterar senha".
          const next = searchParams.get("next")
          router.replace(next && next.startsWith("/") ? next : "/dashboard")
        },
        onError: (error) => {
          setFormError(
            error instanceof ApiError
              ? error.message
              : "Não foi possível entrar. Tente novamente."
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
      <Field label="E-mail institucional" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="username"
          autoFocus
          placeholder="nome.sobrenome@ufsc.br"
          {...register("email")}
        />
      </Field>

      <Field label="Senha" error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
      </Field>

      {formError ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={login.isPending} className="mt-1">
        {login.isPending ? (
          <>
            <HugeiconsIcon
              icon={Loading03Icon}
              strokeWidth={2}
              className="animate-spin"
            />
            Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <Link
        href="/forgot-password"
        className="self-center text-sm text-muted-foreground hover:text-foreground"
      >
        Esqueci minha senha
      </Link>
    </form>
  )
}
