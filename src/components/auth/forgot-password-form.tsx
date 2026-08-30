"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/form/form-field"
import {
  forgotPasswordSchema,
  useForgotPassword,
  type ForgotPasswordFormValues,
} from "@/lib/auth"

export function ForgotPasswordForm() {
  const forgot = useForgotPassword()
  const [enviado, setEnviado] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(values: ForgotPasswordFormValues) {
    // Sucesso e "e-mail não existe" são indistinguíveis por decisão de
    // segurança do backend (sempre 202) — a tela não pode inventar diferença.
    forgot.mutate(values.email.trim().toLowerCase(), {
      onSettled: () => setEnviado(true),
    })
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-4 text-sm">
        <p>
          Se houver uma conta ativa com esse e-mail, o link de redefinição foi
          enviado. Ele vale por 30 minutos.
        </p>
        <Button asChild variant="outline">
          <Link href="/login">Voltar para o login</Link>
        </Button>
      </div>
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

      <Button type="submit" disabled={forgot.isPending}>
        {forgot.isPending ? "Enviando…" : "Enviar link de redefinição"}
      </Button>

      <Link
        href="/login"
        className="self-center text-sm text-muted-foreground hover:text-foreground"
      >
        Voltar para o login
      </Link>
    </form>
  )
}
