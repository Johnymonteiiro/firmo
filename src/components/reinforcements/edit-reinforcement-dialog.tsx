"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { ReinforcementStatusBadge } from "@/components/reinforcements/reinforcement-status-badge"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/form/currency-input"
import { DatePicker } from "@/components/form/date-picker"
import { FormDialog } from "@/components/form/form-dialog"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import { parseBRL } from "@/lib/format"
import {
  updateReinforcementSchema,
  useUpdateReinforcement,
  type EditableReinforcement,
  type UpdateReinforcementFormValues,
} from "@/lib/reinforcements"

function toFormValues(
  reinforcement: EditableReinforcement
): UpdateReinforcementFormValues {
  return {
    sne: reinforcement.sne,
    value: parseBRL(reinforcement.value).toFixed(2),
    reinforcementDate: reinforcement.reinforcementDate.slice(0, 10),
  }
}

export function EditReinforcementDialog({
  reinforcement,
  open,
  onOpenChange,
}: {
  reinforcement: EditableReinforcement
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateReinforcement = useUpdateReinforcement()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateReinforcementFormValues>({
    resolver: standardSchemaResolver(updateReinforcementSchema),
    defaultValues: toFormValues(reinforcement),
  })

  React.useEffect(() => {
    if (open) reset(toFormValues(reinforcement))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onSubmit(values: UpdateReinforcementFormValues) {
    updateReinforcement.mutate(
      { reinforcementId: reinforcement.reinforcementId, input: values },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) updateReinforcement.reset()
  }

  const errorMessage =
    updateReinforcement.error instanceof ApiError
      ? updateReinforcement.error.message
      : updateReinforcement.error
        ? "Não foi possível salvar o reforço."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Editar Reforço"
      formId={`edit-reinforcement-${reinforcement.reinforcementId}`}
      onSubmit={handleSubmit(onSubmit)}
      isPending={updateReinforcement.isPending}
      errorMessage={errorMessage}
      contentClassName="h-auto w-160"
    >
      <SectionTitle>Dados do reforço</SectionTitle>

      <Field label="SNE do reforço" error={errors.sne?.message}>
        <Input
          {...register("sne")}
          placeholder="202600408-R1"
          aria-invalid={!!errors.sne}
        />
      </Field>

      <Field label="Data do reforço" error={errors.reinforcementDate?.message}>
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

      <Field label="Valor (R$)" error={errors.value?.message}>
        <Controller
          control={control}
          name="value"
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.value}
            />
          )}
        />
      </Field>

      <Field label="Etapa">
        {/* Só leitura: a tramitação anda pelo menu "Mover etapa", que respeita
            a ordem do fluxo. Um PATCH comum poderia pular DGER → Concluído. */}
        <div className="flex h-9 items-center">
          <ReinforcementStatusBadge status={reinforcement.status} />
        </div>
      </Field>

      <p className="col-span-2 text-xs text-muted-foreground">
        O processo é herdado do empenho ({reinforcement.processNumber}) e não é
        editável aqui. Reduzir o valor abaixo do que já foi faturado é recusado.
      </p>
    </FormDialog>
  )
}
