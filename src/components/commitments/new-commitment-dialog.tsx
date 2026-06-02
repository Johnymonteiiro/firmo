"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
import { MaskedInput } from "@/components/ui/masked-input"
import { Combobox } from "@/components/form/combobox"
import { DatePicker } from "@/components/form/date-picker"
import { FormDialog } from "@/components/form/form-dialog"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  createCommitmentSchema,
  useCreateCommitment,
  type CreateCommitmentFormValues,
} from "@/lib/commitments"
import { useContracts } from "@/lib/contracts"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

const EMPTY_FORM: CreateCommitmentFormValues = {
  contractId: "",
  sne: "",
  sneDate: "",
  processNumber: "",
  siafi: "",
  initialValue: "",
}

export function NewCommitmentDialog() {
  const [open, setOpen] = React.useState(false)
  const createCommitment = useCreateCommitment()
  const { data: contracts } = useContracts(1, 100)

  const contractOptions = (contracts?.data ?? []).map((c) => ({
    value: c.contractId,
    label: c.contractNumber,
    description: c.company,
  }))

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateCommitmentFormValues>({
    resolver: standardSchemaResolver(createCommitmentSchema),
    defaultValues: EMPTY_FORM,
  })

  function onSubmit(values: CreateCommitmentFormValues) {
    createCommitment.mutate(values, {
      onSuccess: () => {
        reset(EMPTY_FORM)
        setOpen(false)
      },
    })
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      reset(EMPTY_FORM)
      createCommitment.reset()
    }
  }

  const errorMessage =
    createCommitment.error instanceof ApiError
      ? createCommitment.error.message
      : createCommitment.error
        ? "Não foi possível salvar o empenho."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Novo Empenho"
      formId="new-commitment-form"
      onSubmit={handleSubmit(onSubmit)}
      isPending={createCommitment.isPending}
      errorMessage={errorMessage}
      trigger={
        <Button size="sm" className="gap-2">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          Novo Empenho
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
            <MaskedInput
              mask="00000.000000/0000-00"
              placeholder="23080.003729/2026-38"
              value={field.value}
              onAccept={(value) => field.onChange(value)}
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

      <Field label="Valor Inicial (R$)" error={errors.initialValue?.message}>
        <Controller
          control={control}
          name="initialValue"
          render={({ field }) => (
            <MaskedInput
              mask={Number}
              scale={2}
              thousandsSeparator="."
              radix=","
              mapToRadix={["."]}
              padFractionalZeros
              normalizeZeros
              unmask
              inputMode="decimal"
              placeholder="0,00"
              value={field.value}
              onAccept={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              aria-invalid={!!errors.initialValue}
            />
          )}
        />
      </Field>
    </FormDialog>
  )
}
