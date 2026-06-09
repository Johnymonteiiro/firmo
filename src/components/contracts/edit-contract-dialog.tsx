"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/form/currency-input"
import { DatePicker } from "@/components/form/date-picker"
import { FormDialog } from "@/components/form/form-dialog"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  updateContractSchema,
  useUpdateContract,
  type Contract,
  type UpdateContractFormValues,
} from "@/lib/contracts"
import { parseBRL } from "@/lib/format"

function toFormValues(c: Contract): UpdateContractFormValues {
  return {
    company: c.company,
    subject: c.subject,
    manager: c.manager,
    adminFiscal: c.adminFiscal,
    techFiscals: c.techFiscals,
    startDate: c.startDate?.slice(0, 10) ?? "",
    expiresAt: c.expiresAt?.slice(0, 10) ?? "",
    monthlyValue: parseBRL(c.monthlyValue).toFixed(2),
    notes: c.notes ?? "",
  }
}

export function EditContractDialog({
  contract,
  open,
  onOpenChange,
}: {
  contract: Contract
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateContract = useUpdateContract()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateContractFormValues>({
    resolver: standardSchemaResolver(updateContractSchema),
    defaultValues: toFormValues(contract),
  })

  // Recarrega os valores do contrato ao abrir.
  React.useEffect(() => {
    if (open) reset(toFormValues(contract))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onSubmit(values: UpdateContractFormValues) {
    updateContract.mutate(
      {
        contractId: contract.contractId,
        input: {
          ...values,
          notes: values.notes?.trim() ? values.notes.trim() : null,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) updateContract.reset()
  }

  const errorMessage =
    updateContract.error instanceof ApiError
      ? updateContract.error.message
      : updateContract.error
        ? "Não foi possível salvar o contrato."
        : null

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={`Editar Contrato ${contract.contractNumber}`}
      formId="edit-contract-form"
      onSubmit={handleSubmit(onSubmit)}
      isPending={updateContract.isPending}
      errorMessage={errorMessage}
    >
      <SectionTitle>Identificação (não editável)</SectionTitle>
      <Field label="Nº de contrato">
        <Input value={contract.contractNumber} disabled readOnly />
      </Field>
      <Field label="Processo">
        <Input value={contract.processNumber} disabled readOnly />
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
              <CurrencyInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={!!errors.monthlyValue}
              />
            )}
          />
        </Field>
      </div>

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
