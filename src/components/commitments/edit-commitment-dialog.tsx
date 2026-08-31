"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Input } from "@/components/ui/input"
import { MaskedInput } from "@/components/ui/masked-input"
import { CurrencyInput } from "@/components/form/currency-input"
import { DatePicker } from "@/components/form/date-picker"
import { FormDialog } from "@/components/form/form-dialog"
import { ProcessInput } from "@/components/form/process-input"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  updateCommitmentSchema,
  useUpdateCommitment,
  type Commitment,
  type UpdateCommitmentFormValues,
} from "@/lib/commitments"
import { parseBRL } from "@/lib/format"

/** O empenho chega com valores já em BRL; o formulário trabalha em decimal. */
function toFormValues(commitment: Commitment): UpdateCommitmentFormValues {
  return {
    contractedCompany: commitment.contractedCompany,
    sne: commitment.sne,
    sneDate: commitment.sneDate.slice(0, 10),
    processNumber: commitment.processNumber,
    siafi: commitment.siafi,
    initialValue: parseBRL(commitment.initialValue).toFixed(2),
  }
}

export function EditCommitmentDialog({
  commitment,
  open,
  onOpenChange,
}: {
  commitment: Commitment
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateCommitment = useUpdateCommitment()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateCommitmentFormValues>({
    resolver: standardSchemaResolver(updateCommitmentSchema),
    defaultValues: toFormValues(commitment),
  })

  // Recarrega os valores do empenho ao abrir.
  React.useEffect(() => {
    if (open) reset(toFormValues(commitment))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onSubmit(values: UpdateCommitmentFormValues) {
    updateCommitment.mutate(
      { commitmentId: commitment.commitmentId, input: values },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) updateCommitment.reset()
  }

  const errorMessage =
    updateCommitment.error instanceof ApiError
      ? updateCommitment.error.message
      : updateCommitment.error
        ? "Não foi possível salvar o empenho."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Editar Empenho"
      formId={`edit-commitment-${commitment.commitmentId}`}
      onSubmit={handleSubmit(onSubmit)}
      isPending={updateCommitment.isPending}
      errorMessage={errorMessage}
      // Sete campos não preenchem a altura fixa do diálogo de criação — aqui
      // a caixa acompanha o conteúdo.
      contentClassName="h-auto max-h-[85vh] w-180"
    >
      <SectionTitle>Dados do empenho</SectionTitle>

      <Field label="SNE" error={errors.sne?.message}>
        <Controller
          control={control}
          name="sne"
          render={({ field }) => (
            <MaskedInput
              mask="000000000"
              placeholder="202600408"
              value={field.value}
              onAccept={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              aria-invalid={!!errors.sne}
            />
          )}
        />
      </Field>

      <Field label="Data do SNE" error={errors.sneDate?.message}>
        <Controller
          control={control}
          name="sneDate"
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.sneDate}
            />
          )}
        />
      </Field>

      <Field
        label="Processo"
        error={errors.processNumber?.message}
        className="col-span-2"
      >
        <Controller
          control={control}
          name="processNumber"
          render={({ field }) => (
            <ProcessInput
              placeholder="003729/2026-38"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.processNumber}
            />
          )}
        />
      </Field>

      <Field label="SIAFI" error={errors.siafi?.message}>
        <Controller
          control={control}
          name="siafi"
          render={({ field }) => (
            <MaskedInput
              mask="0000NE000000"
              placeholder="2026NE000177"
              value={field.value}
              onAccept={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              aria-invalid={!!errors.siafi}
            />
          )}
        />
      </Field>

      <Field
        label="Empresa"
        error={errors.contractedCompany?.message}
        className="col-span-2"
      >
        <Input
          {...register("contractedCompany")}
          placeholder="Razão social na data do empenho"
          aria-invalid={!!errors.contractedCompany}
        />
      </Field>

      <SectionTitle>Valor</SectionTitle>

      <Field label="Valor Inicial (R$)" error={errors.initialValue?.message}>
        <Controller
          control={control}
          name="initialValue"
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.initialValue}
            />
          )}
        />
      </Field>

      <Field label="Saldo atual">
        {/* Só leitura: o saldo é recalculado pelo banco a partir do valor
            inicial, dos reforços e do que já foi faturado. */}
        <Input
          value={commitment.currentBalance}
          readOnly
          disabled
          className="font-mono tabular-nums"
        />
      </Field>

      <p className="col-span-2 text-xs text-muted-foreground">
        Reduzir o valor inicial abaixo do que já foi faturado nesta SNE é
        recusado — o saldo do empenho não pode ficar negativo.
      </p>
    </FormDialog>
  )
}
