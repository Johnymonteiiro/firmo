"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaskedInput } from "@/components/ui/masked-input"
import { FormDialog } from "@/components/form/form-dialog"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  creditorSchema,
  useCreateCreditor,
  useUpdateCreditor,
  type Creditor,
  type CreditorFormOutput,
  type CreditorFormValues,
} from "@/lib/non-continuous"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

// O ano trafega como texto no formulário (é o que o campo com máscara
// guarda); o schema converte para número na validação.
const emptyForm = (): CreditorFormValues => ({
  creditor: "",
  object: "",
  year: String(new Date().getFullYear()),
})

const toFormValues = (creditor: Creditor): CreditorFormValues => ({
  creditor: creditor.creditor,
  object: creditor.object,
  year: String(creditor.year),
})

/**
 * Um único dialog para cadastro e edição: os três campos são os mesmos, e o
 * PATCH aceita exatamente o que o POST aceita. `creditor` ausente = cadastro.
 */
export function CreditorFormDialog({
  creditor,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  creditor?: Creditor
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isEdit = !!creditor
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen

  const createCreditor = useCreateCreditor()
  const updateCreditor = useUpdateCreditor()
  const mutation = isEdit ? updateCreditor : createCreditor

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreditorFormValues, unknown, CreditorFormOutput>({
    resolver: standardSchemaResolver(creditorSchema),
    defaultValues: creditor ? toFormValues(creditor) : emptyForm(),
  })

  // Recarrega os valores do registro ao reabrir.
  React.useEffect(() => {
    if (open) reset(creditor ? toFormValues(creditor) : emptyForm())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onSubmit(values: CreditorFormOutput) {
    const onSuccess = () => {
      reset(creditor ? toFormValues(creditor) : emptyForm())
      setOpen(false)
    }

    if (creditor) {
      updateCreditor.mutate(
        { creditorId: creditor.creditorId, input: values },
        { onSuccess }
      )
      return
    }
    createCreditor.mutate(values, { onSuccess })
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      reset(creditor ? toFormValues(creditor) : emptyForm())
      mutation.reset()
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Não foi possível salvar o registro."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "Editar Credor" : "Novo Credor"}
      formId={isEdit ? `edit-creditor-${creditor.creditorId}` : "new-creditor"}
      onSubmit={handleSubmit(onSubmit)}
      isPending={mutation.isPending}
      errorMessage={errorMessage}
      contentClassName="h-auto w-160"
      trigger={
        isEdit ? undefined : (
          <Button size="sm" className="gap-2">
            <HugeiconsIcon
              icon={Add01Icon}
              strokeWidth={2}
              className="size-4"
            />
            Novo Credor
          </Button>
        )
      }
    >
      <SectionTitle>Identificação</SectionTitle>

      <Field
        label="Credor"
        error={errors.creditor?.message}
        className="col-span-2"
      >
        <Input
          placeholder="Gonçalves e Duwe Lavanderia Ltda"
          aria-invalid={!!errors.creditor}
          {...register("creditor")}
        />
      </Field>

      <Field label="Objeto" error={errors.object?.message}>
        <Input
          placeholder="Becas"
          aria-invalid={!!errors.object}
          {...register("object")}
        />
      </Field>

      <Field label="Ano" error={errors.year?.message}>
        <Controller
          control={control}
          name="year"
          render={({ field }) => (
            <MaskedInput
              mask="0000"
              inputMode="numeric"
              placeholder="2026"
              value={field.value ?? ""}
              onAccept={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              aria-invalid={!!errors.year}
            />
          )}
        />
      </Field>
    </FormDialog>
  )
}
