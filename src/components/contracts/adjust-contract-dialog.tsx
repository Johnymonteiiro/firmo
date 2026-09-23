"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/form/currency-input"
import { FormDialog } from "@/components/form/form-dialog"
import { MonthPicker } from "@/components/form/month-picker"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  adjustContractSchema,
  useAdjustContract,
  type AdjustContractFormValues,
  type Contract,
} from "@/lib/contracts"

const EMPTY_FORM: AdjustContractFormValues = {
  monthlyValue: "",
  period: "",
}

/** "2026-03" (MonthPicker) → "03/2026" (como o backend grava). */
function periodToMonthYear(period: string): string {
  const [year, month] = period.split("-")
  return `${month}/${year}`
}

/**
 * Reajuste do valor mensal. Cada reajuste é acrescentado ao histórico do
 * contrato — é o histórico que permite saber quanto o contrato valia na
 * competência de um faturamento antigo. Por isso não fica no "Editar
 * contrato": editar corrige um dado, reajustar cria um fato novo.
 */
export function AdjustContractDialog({
  contract,
  open,
  onOpenChange,
}: {
  contract: Contract
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const adjust = useAdjustContract()

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AdjustContractFormValues>({
    resolver: standardSchemaResolver(adjustContractSchema),
    defaultValues: EMPTY_FORM,
  })

  React.useEffect(() => {
    if (open) reset(EMPTY_FORM)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onSubmit(values: AdjustContractFormValues) {
    adjust.mutate(
      {
        contractId: contract.contractId,
        input: {
          monthlyValue: values.monthlyValue,
          monthYear: periodToMonthYear(values.period),
        },
      },
      {
        onSuccess: () => {
          reset(EMPTY_FORM)
          onOpenChange(false)
        },
      }
    )
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) adjust.reset()
  }

  const errorMessage =
    adjust.error instanceof ApiError
      ? adjust.error.message
      : adjust.error
        ? "Não foi possível reajustar o contrato."
        : null

  const ultimo = contract.adjustments.at(-1)

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={`Reajustar Contrato ${contract.contractNumber}`}
      formId={`adjust-contract-${contract.contractId}`}
      onSubmit={handleSubmit(onSubmit)}
      isPending={adjust.isPending}
      errorMessage={errorMessage}
      submitLabel="Reajustar"
      pendingLabel="Reajustando…"
      contentClassName="h-auto w-140"
    >
      <SectionTitle>Valor vigente</SectionTitle>
      <Field label="Valor mensal de hoje">
        <Input value={contract.effectiveMonthlyValue} disabled readOnly />
      </Field>
      <Field label="Último reajuste">
        <Input
          value={
            ultimo ? `${ultimo.monthlyValue} · ${ultimo.monthYear}` : "Nenhum"
          }
          disabled
          readOnly
        />
      </Field>

      <SectionTitle>Novo reajuste</SectionTitle>
      <Field
        label="Novo Valor Mensal (R$)"
        error={errors.monthlyValue?.message}
      >
        <Controller
          control={control}
          name="monthlyValue"
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.monthlyValue}
            />
          )}
        />
      </Field>
      <Field label="Vigência (mês/ano)" error={errors.period?.message}>
        <Controller
          control={control}
          name="period"
          render={({ field }) => (
            <MonthPicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.period}
            />
          )}
        />
      </Field>

      <p className="col-span-2 text-xs text-muted-foreground">
        O novo valor passa a valer a partir dessa competência. Faturamentos de
        competências anteriores continuam comparados ao valor da época.
      </p>
    </FormDialog>
  )
}
