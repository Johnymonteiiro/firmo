"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaskedInput } from "@/components/ui/masked-input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/form/date-picker"
import { FormDialog } from "@/components/form/form-dialog"
import { ProcessInput } from "@/components/form/process-input"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  createContractSchema,
  useCreateContract,
  type CreateContractFormValues,
} from "@/lib/contracts"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

const EMPTY_FORM: CreateContractFormValues = {
  contractNumber: "",
  processNumber: "",
  adminFiscal: "",
  techFiscals: "",
  company: "",
  subject: "",
  manager: "",
  startDate: "",
  expiresAt: "",
  monthlyValue: "",
  notes: "",
}

export function NewContractDialog() {
  const [open, setOpen] = React.useState(false)
  const createContract = useCreateContract()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateContractFormValues>({
    resolver: standardSchemaResolver(createContractSchema),
    defaultValues: EMPTY_FORM,
  })

  function onSubmit(values: CreateContractFormValues) {
    createContract.mutate(
      {
        ...values,
        notes: values.notes?.trim() ? values.notes.trim() : null,
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
      createContract.reset()
    }
  }

  const errorMessage =
    createContract.error instanceof ApiError
      ? createContract.error.message
      : createContract.error
        ? "Não foi possível salvar o contrato."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Novo Contrato"
      formId="new-contract-form"
      onSubmit={handleSubmit(onSubmit)}
      isPending={createContract.isPending}
      errorMessage={errorMessage}
      trigger={
        <Button size="sm" className="gap-2">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          Novo Contrato
        </Button>
      }
    >
      <SectionTitle>Identificação</SectionTitle>
      <Field label="Nº de contrato" error={errors.contractNumber?.message}>
        <Controller
          control={control}
          name="contractNumber"
          render={({ field }) => (
            <MaskedInput
              mask="0000/0000"
              placeholder="0097/2023"
              value={field.value}
              onAccept={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              aria-invalid={!!errors.contractNumber}
            />
          )}
        />
      </Field>

      <Field label="Processo" error={errors.processNumber?.message}>
        <Controller
          control={control}
          name="processNumber"
          render={({ field }) => (
            <ProcessInput
              placeholder="048126/2020-70"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.processNumber}
            />
          )}
        />
      </Field>

      <SectionTitle>Contratada</SectionTitle>
      <Field
        label="Empresa Contratada"
        error={errors.company?.message}
        className="col-span-2"
      >
        <Input
          placeholder="Nome da empresa"
          aria-invalid={!!errors.company}
          {...register("company")}
        />
      </Field>

      <Field label="Objeto" error={errors.subject?.message} className="col-span-2">
        <Textarea
          placeholder="Descrição do objeto do contrato"
          rows={2}
          aria-invalid={!!errors.subject}
          {...register("subject")}
        />
      </Field>

      <SectionTitle>Responsáveis</SectionTitle>
      <Field label="Gestor" error={errors.manager?.message}>
        <Input
          placeholder="Nome do gestor"
          aria-invalid={!!errors.manager}
          {...register("manager")}
        />
      </Field>

      <Field label="Fiscal Adm" error={errors.adminFiscal?.message}>
        <Input
          placeholder="Nome do fiscal administrativo"
          aria-invalid={!!errors.adminFiscal}
          {...register("adminFiscal")}
        />
      </Field>

      <Field
        label="Fiscais Técnicos"
        error={errors.techFiscals?.message}
        className="col-span-2"
      >
        <Input
          placeholder="Nomes dos fiscais técnicos (separados por vírgula)"
          aria-invalid={!!errors.techFiscals}
          {...register("techFiscals")}
        />
      </Field>

      <SectionTitle>Vigência e Valor</SectionTitle>
      <div className="col-span-2 grid grid-cols-3 gap-4">
        <Field label="Data de Início" error={errors.startDate?.message}>
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={!!errors.startDate}
              />
            )}
          />
        </Field>

        <Field label="Vencimento do Contrato" error={errors.expiresAt?.message}>
          <Controller
            control={control}
            name="expiresAt"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={!!errors.expiresAt}
              />
            )}
          />
        </Field>

        <Field label="Valor Mensal (R$)" error={errors.monthlyValue?.message}>
          <Controller
            control={control}
            name="monthlyValue"
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
                aria-invalid={!!errors.monthlyValue}
              />
            )}
          />
        </Field>
      </div>

      <SectionTitle>Observações</SectionTitle>
      <Field
        label="Observação"
        error={errors.notes?.message}
        className="col-span-2"
      >
        <Textarea
          placeholder="Observações adicionais (opcional)"
          rows={3}
          {...register("notes")}
        />
      </Field>
    </FormDialog>
  )
}
