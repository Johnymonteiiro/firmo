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
import { useCommitments, type Commitment } from "@/lib/commitments"
import {
  createReinforcementSchema,
  useCreateReinforcement,
  type CreateReinforcementFormValues,
} from "@/lib/reinforcements"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

export interface NewReinforcementDialogProps {
  /**
   * Empenho pré-selecionado (ação "Adicionar Reforço" na linha do empenho).
   * Quando presente, o vínculo fica travado e o processo herdado é exibido.
   */
  commitment?: Commitment
  /** Modo controlado (sem trigger próprio) — usado pelo menu de ações. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewReinforcementDialog({
  commitment,
  open: controlledOpen,
  onOpenChange,
}: NewReinforcementDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setUncontrolledOpen

  const createReinforcement = useCreateReinforcement()
  // Só busca a lista quando o empenho não veio pré-selecionado.
  const { data: commitments } = useCommitments(1, 100)

  const commitmentOptions = (commitments?.data ?? []).map((c) => ({
    value: c.commitmentId,
    label: c.sne,
    description: c.contractedCompany,
  }))

  const emptyForm: CreateReinforcementFormValues = React.useMemo(
    () => ({
      commitmentId: commitment?.commitmentId ?? "",
      value: "",
      reinforcementDate: "",
    }),
    [commitment]
  )

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateReinforcementFormValues>({
    resolver: standardSchemaResolver(createReinforcementSchema),
    defaultValues: emptyForm,
  })

  function onSubmit(values: CreateReinforcementFormValues) {
    createReinforcement.mutate(values, {
      onSuccess: () => {
        reset(emptyForm)
        setOpen(false)
      },
    })
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      reset(emptyForm)
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
      // Form pequeno (4 campos): altura acompanha o conteúdo, largura enxuta.
      contentClassName="h-auto max-h-[85vh] w-130 p-8"
      trigger={
        isControlled ? undefined : (
          <Button size="sm" className="gap-2">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Novo Reforço
          </Button>
        )
      }
    >
      <SectionTitle>Vínculo</SectionTitle>
      {commitment ? (
        <>
          <Field label="Empenho (SNE)">
            <Input value={commitment.sne} disabled readOnly />
          </Field>
          <Field label="Processo (herdado do empenho)">
            <Input value={commitment.processNumber} disabled readOnly />
          </Field>
        </>
      ) : (
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
      )}

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
    </FormDialog>
  )
}
