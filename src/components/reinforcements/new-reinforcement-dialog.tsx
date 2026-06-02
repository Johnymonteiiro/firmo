"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaskedInput } from "@/components/ui/masked-input"
import { Combobox } from "@/components/form/combobox"
import { DatePicker } from "@/components/form/date-picker"
import { FormDialog } from "@/components/form/form-dialog"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import { useCommitments } from "@/lib/commitments"
import {
  createReinforcementSchema,
  useCreateReinforcement,
  type CreateReinforcementFormValues,
} from "@/lib/reinforcements"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

const EMPTY_FORM: CreateReinforcementFormValues = {
  commitmentId: "",
  value: "",
  processNumber: "",
  reinforcementDate: "",
  reinforcedBy: "",
}

export function NewReinforcementDialog() {
  const [open, setOpen] = React.useState(false)
  const createReinforcement = useCreateReinforcement()
  const { data: commitments } = useCommitments(1, 100)

  const commitmentOptions = (commitments?.data ?? []).map((c) => ({
    value: c.commitmentId,
    label: c.sne,
    description: c.contractedCompany,
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateReinforcementFormValues>({
    resolver: standardSchemaResolver(createReinforcementSchema),
    defaultValues: EMPTY_FORM,
  })

  function onSubmit(values: CreateReinforcementFormValues) {
    createReinforcement.mutate(values, {
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
      createReinforcement.reset()
    }
  }

  const errorMessage =
    createReinforcement.error instanceof ApiError
      ? createReinforcement.error.message
      : createReinforcement.error
        ? "Não foi possível salvar o reforço."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Novo Reforço"
      formId="new-reinforcement-form"
      onSubmit={handleSubmit(onSubmit)}
      isPending={createReinforcement.isPending}
      errorMessage={errorMessage}
      trigger={
        <Button size="sm" className="gap-2">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          Novo Reforço
        </Button>
      }
    >
      <SectionTitle>Vínculo</SectionTitle>
      <Field
        label="Empenho"
        error={errors.commitmentId?.message}
        className="col-span-2"
      >
        <Controller
          control={control}
          name="commitmentId"
          render={({ field }) => (
            <Combobox
              options={commitmentOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Selecione o empenho"
              searchPlaceholder="Buscar por SNE ou empresa..."
              emptyText="Nenhum empenho encontrado."
              aria-invalid={!!errors.commitmentId}
            />
          )}
        />
      </Field>

      <SectionTitle>Dados do reforço</SectionTitle>
      <Field label="Valor (R$)" error={errors.value?.message}>
        <Controller
          control={control}
          name="value"
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
              aria-invalid={!!errors.value}
            />
          )}
        />
      </Field>

      <Field label="Data do Reforço" error={errors.reinforcementDate?.message}>
        <Controller
          control={control}
          name="reinforcementDate"
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.reinforcementDate}
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

      <Field
        label="Reforçado por"
        error={errors.reinforcedBy?.message}
        className="col-span-2"
      >
        <Input
          placeholder="Nome do responsável"
          aria-invalid={!!errors.reinforcedBy}
          {...register("reinforcedBy")}
        />
      </Field>
    </FormDialog>
  )
}
