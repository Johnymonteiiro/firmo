"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/form/combobox"
import { CurrencyInput } from "@/components/form/currency-input"
import { DatePicker } from "@/components/form/date-picker"
import { FormDialog } from "@/components/form/form-dialog"
import { ProcessInput } from "@/components/form/process-input"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import { parseBRL } from "@/lib/format"
import {
  movementSchema,
  useCreateMovement,
  useCreditors,
  useUpdateMovement,
  type Movement,
  type MovementFormValues,
  type UpdateMovementInput,
} from "@/lib/non-continuous"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

const emptyForm = (creditorId = ""): MovementFormValues => ({
  creditorId,
  issueDate: "",
  sequentialNumber: "",
  processNumber: "",
  qualification: "EMPENHO",
  value: "",
  paymentDate: "",
})

const toFormValues = (movement: Movement): MovementFormValues => ({
  creditorId: movement.creditorId,
  issueDate: movement.issueDate.slice(0, 10),
  sequentialNumber: movement.sequentialNumber,
  processNumber: movement.processNumber,
  qualification: movement.qualification,
  value: parseBRL(movement.value).toFixed(2),
  paymentDate: movement.paymentDate?.slice(0, 10) ?? "",
})

/**
 * Cadastro e edição de movimento. Na edição o credor fica travado — mover um
 * lançamento de credor é outro lançamento, não uma correção.
 */
export function MovementFormDialog({
  movement,
  defaultCreditorId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  movement?: Movement
  /** Pré-seleciona o credor (usado quando a tela já está filtrada por um). */
  defaultCreditorId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isEdit = !!movement
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen

  const createMovement = useCreateMovement()
  const updateMovement = useUpdateMovement()
  const mutation = isEdit ? updateMovement : createMovement

  const { data: creditors } = useCreditors(1, 100)
  const creditorOptions = (creditors?.data ?? []).map((c) => ({
    value: c.creditorId,
    label: c.creditor,
    description: `${c.object} · ${c.year} · saldo ${c.currentBalance}`,
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MovementFormValues>({
    resolver: standardSchemaResolver(movementSchema),
    defaultValues: movement
      ? toFormValues(movement)
      : emptyForm(defaultCreditorId),
  })

  const qualification = useWatch({ control, name: "qualification" })
  const isPayment = qualification === "PAGAMENTO"

  React.useEffect(() => {
    if (open) {
      reset(movement ? toFormValues(movement) : emptyForm(defaultCreditorId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // RF-NC10: virar empenho limpa a data de pagamento em vez de deixá-la
  // preenchida e invisível — o backend recusaria o par.
  React.useEffect(() => {
    if (!isPayment) setValue("paymentDate", "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPayment])

  function onSubmit(values: MovementFormValues) {
    const onSuccess = () => {
      reset(movement ? toFormValues(movement) : emptyForm(defaultCreditorId))
      setOpen(false)
    }

    const paymentDate = values.paymentDate ? values.paymentDate : null

    if (movement) {
      // `creditorId` fica de fora: o PATCH não aceita trocar o credor.
      const input: UpdateMovementInput = {
        issueDate: values.issueDate,
        sequentialNumber: values.sequentialNumber,
        processNumber: values.processNumber,
        qualification: values.qualification,
        value: values.value,
        paymentDate,
      }
      updateMovement.mutate(
        { movementId: movement.movementId, input },
        { onSuccess }
      )
      return
    }

    createMovement.mutate({ ...values, paymentDate }, { onSuccess })
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      reset(movement ? toFormValues(movement) : emptyForm(defaultCreditorId))
      mutation.reset()
    }
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Não foi possível salvar o movimento."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "Editar Movimento" : "Novo Empenho ou Pagamento"}
      formId={isEdit ? `edit-movement-${movement.movementId}` : "new-movement"}
      onSubmit={handleSubmit(onSubmit)}
      isPending={mutation.isPending}
      errorMessage={errorMessage}
      trigger={
        isEdit ? undefined : (
          <Button size="sm" className="gap-2">
            <HugeiconsIcon
              icon={Add01Icon}
              strokeWidth={2}
              className="size-4"
            />
            Novo Lançamento
          </Button>
        )
      }
    >
      <SectionTitle>Credor</SectionTitle>
      <Field
        label="Credor"
        error={errors.creditorId?.message}
        className="col-span-2"
      >
        <Controller
          control={control}
          name="creditorId"
          render={({ field }) => (
            <Combobox
              options={creditorOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={isEdit}
              placeholder="Selecione o credor"
              searchPlaceholder="Buscar por credor..."
              emptyText="Nenhum credor encontrado."
              aria-invalid={!!errors.creditorId}
            />
          )}
        />
      </Field>

      <SectionTitle>Lançamento</SectionTitle>

      <Field label="Qualificação" error={errors.qualification?.message}>
        <Controller
          control={control}
          name="qualification"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.qualification}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPENHO">Empenho</SelectItem>
                <SelectItem value="PAGAMENTO">Pagamento</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Data de emissão" error={errors.issueDate?.message}>
        <Controller
          control={control}
          name="issueDate"
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.issueDate}
            />
          )}
        />
      </Field>

      <Field label="Sequencial" error={errors.sequentialNumber?.message}>
        <Input
          placeholder="202301230"
          className="font-mono"
          aria-invalid={!!errors.sequentialNumber}
          {...register("sequentialNumber")}
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
              placeholder="007668/2023-35"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.processNumber}
            />
          )}
        />
      </Field>

      <Field label="Data do pagamento" error={errors.paymentDate?.message}>
        <Controller
          control={control}
          name="paymentDate"
          render={({ field }) => (
            // Desabilitado em empenho (RF-NC10): o campo continua visível para
            // a linha do formulário não dançar ao trocar a qualificação.
            <div
              aria-disabled={!isPayment}
              className={
                isPayment ? undefined : "pointer-events-none opacity-50"
              }
            >
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={isPayment ? undefined : "Só em pagamento"}
                aria-invalid={!!errors.paymentDate}
              />
            </div>
          )}
        />
      </Field>
    </FormDialog>
  )
}
