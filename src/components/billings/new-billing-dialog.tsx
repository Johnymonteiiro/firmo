"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
import { MaskedInput } from "@/components/ui/masked-input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/form/combobox"
import { CurrencyInput } from "@/components/form/currency-input"
import { MonthPicker } from "@/components/form/month-picker"
import { FormDialog } from "@/components/form/form-dialog"
import { ProcessInput } from "@/components/form/process-input"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  createBillingSchema,
  useCreateBilling,
  type CreateBillingFormValues,
} from "@/lib/billings"
import { useCommitments } from "@/lib/commitments"
import { useContracts } from "@/lib/contracts"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

const EMPTY_FORM: CreateBillingFormValues = {
  contractId: "",
  period: "",
  sneDeduction1: "",
  billedAmount1: "",
  sneDeduction2: "",
  billedAmount2: "",
  paymentProcessNumber: "",
  paymentRequestNumber: "",
  notes: "",
}

const toNull = (v?: string) => (v && v.trim() ? v.trim() : null)

export function NewBillingDialog() {
  const [open, setOpen] = React.useState(false)
  const createBilling = useCreateBilling()
  const { data: contracts } = useContracts(1, 100)
  const { data: commitments } = useCommitments(1, 100)

  const contractOptions = (contracts?.data ?? []).map((c) => ({
    value: c.contractId,
    label: c.contractNumber,
    description: c.company,
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateBillingFormValues>({
    resolver: standardSchemaResolver(createBillingSchema),
    defaultValues: EMPTY_FORM,
  })

  // SNEs de desconto = empenhos (filtrados pelo contrato selecionado).
  const selectedContractId = watch("contractId")
  const contractCommitments = (commitments?.data ?? []).filter(
    (c) => !selectedContractId || c.contractId === selectedContractId
  )
  const sneOptions = contractCommitments.map((c) => ({
    value: c.sne,
    label: c.sne,
    description: c.contractedCompany,
  }))

  // Regra GFC (alerta, não bloqueio): ao faturar numa SNE do ano corrente,
  // avisar se o contrato ainda tem empenho antigo com saldo (status SALDO).
  const selectedSnes = [watch("sneDeduction1"), watch("sneDeduction2")].filter(
    Boolean
  )
  const usingCurrentSne = selectedSnes.some(
    (sne) => contractCommitments.find((c) => c.sne === sne)?.status === "VIGENTE"
  )
  const oldSnesWithBalance = contractCommitments.filter(
    (c) => c.status === "SALDO" && !selectedSnes.includes(c.sne)
  )
  const showOldSneWarning = usingCurrentSne && oldSnesWithBalance.length > 0

  function onSubmit(values: CreateBillingFormValues) {
    createBilling.mutate(
      {
        contractId: values.contractId,
        period: values.period,
        sneDeduction1: toNull(values.sneDeduction1),
        billedAmount1: toNull(values.billedAmount1),
        sneDeduction2: toNull(values.sneDeduction2),
        billedAmount2: toNull(values.billedAmount2),
        paymentProcessNumber: toNull(values.paymentProcessNumber),
        paymentRequestNumber: toNull(values.paymentRequestNumber),
        notes: toNull(values.notes),
      },
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
      createBilling.reset()
    }
  }

  const errorMessage =
    createBilling.error instanceof ApiError
      ? createBilling.error.message
      : createBilling.error
        ? "Não foi possível salvar o faturamento."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Novo Faturamento"
      formId="new-billing-form"
      onSubmit={handleSubmit(onSubmit)}
      isPending={createBilling.isPending}
      errorMessage={errorMessage}
      trigger={
        <Button size="sm" className="gap-2">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          Novo Faturamento
        </Button>
      }
    >
      <SectionTitle>Vínculo</SectionTitle>
      <Field label="Contrato" error={errors.contractId?.message} className="col-span-2">
        <Controller
          control={control}
          name="contractId"
          render={({ field }) => (
            <Combobox
              options={contractOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Selecione o contrato"
              searchPlaceholder="Buscar por nº ou empresa..."
              emptyText="Nenhum contrato encontrado."
              aria-invalid={!!errors.contractId}
            />
          )}
        />
      </Field>

      <Field label="Competência" error={errors.period?.message} className="col-span-2">
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

      <SectionTitle>Desconto 1</SectionTitle>
      <Field label="SNE Desconto 1" error={errors.sneDeduction1?.message}>
        <Controller
          control={control}
          name="sneDeduction1"
          render={({ field }) => (
            <Combobox
              options={sneOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Selecione o empenho (SNE)"
              searchPlaceholder="Buscar SNE..."
              emptyText="Nenhum empenho para o contrato."
              aria-invalid={!!errors.sneDeduction1}
            />
          )}
        />
      </Field>
      <Field label="Valor Faturado 1 (R$)" error={errors.billedAmount1?.message}>
        <Controller
          control={control}
          name="billedAmount1"
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.billedAmount1}
            />
          )}
        />
      </Field>

      <SectionTitle>Desconto 2</SectionTitle>
      <Field label="SNE Desconto 2" error={errors.sneDeduction2?.message}>
        <Controller
          control={control}
          name="sneDeduction2"
          render={({ field }) => (
            <Combobox
              options={sneOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Selecione o empenho (SNE)"
              searchPlaceholder="Buscar SNE..."
              emptyText="Nenhum empenho para o contrato."
              aria-invalid={!!errors.sneDeduction2}
            />
          )}
        />
      </Field>
      <Field label="Valor Faturado 2 (R$)" error={errors.billedAmount2?.message}>
        <Controller
          control={control}
          name="billedAmount2"
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.billedAmount2}
            />
          )}
        />
      </Field>

      {showOldSneWarning ? (
        <div className="col-span-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
          <p className="font-medium">SNE antiga com saldo disponível</p>
          <p className="mt-0.5 text-warning/90">
            Antes de consumir a SNE atual, considere usar o saldo remanescente
            de:{" "}
            {oldSnesWithBalance
              .map((c) => `${c.sne} (${c.currentBalance})`)
              .join(", ")}
            .
          </p>
        </div>
      ) : null}

      {/* "Economia" (Valor Economizado) agora é calculada pelo sistema. */}
      <SectionTitle>Pagamento</SectionTitle>
      <Field
        label="Solicitação de Pagamento"
        error={errors.paymentRequestNumber?.message}
      >
        <Controller
          control={control}
          name="paymentRequestNumber"
          render={({ field }) => (
            <MaskedInput
              mask="000000000"
              placeholder="202307961"
              value={field.value}
              onAccept={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              aria-invalid={!!errors.paymentRequestNumber}
            />
          )}
        />
      </Field>
      <Field
        label="Processo de Pagamento"
        error={errors.paymentProcessNumber?.message}
        className="col-span-2"
      >
        <Controller
          control={control}
          name="paymentProcessNumber"
          render={({ field }) => (
            <ProcessInput
              placeholder="003729/2026-38"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.paymentProcessNumber}
            />
          )}
        />
      </Field>

      <SectionTitle>Observações</SectionTitle>
      <Field label="Observação" error={errors.notes?.message} className="col-span-2">
        <Textarea
          placeholder="Observações adicionais (opcional)"
          rows={3}
          {...register("notes")}
        />
      </Field>
    </FormDialog>
  )
}
