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
import { UserMultiPicker, UserPicker } from "@/components/form/user-picker"
import { ApiError } from "@/lib/api"
import {
  updateContractSchema,
  useUpdateContract,
  type Contract,
  type UpdateContractFormValues,
  type UpdateContractInput,
} from "@/lib/contracts"
import { parseBRL } from "@/lib/format"

/** Mesma composição de fiscais técnicos, independente da ordem. */
function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && [...a].sort().join() === [...b].sort().join()
}

/** IDs vinculados; vazio quando o contrato só tem o texto legado no papel. */
function linkedTechFiscalIds(c: Contract): string[] {
  return c.techFiscals
    .map((ref) => ref.userId)
    .filter((id): id is string => id !== null)
}

function toFormValues(c: Contract): UpdateContractFormValues {
  return {
    company: c.company,
    subject: c.subject,
    managerId: c.manager.userId ?? "",
    adminFiscalId: c.adminFiscal.userId ?? "",
    techFiscalIds: linkedTechFiscalIds(c),
    startDate: c.startDate?.slice(0, 10) ?? "",
    expiresAt: c.expiresAt?.slice(0, 10) ?? "",
    monthlyValue: parseBRL(c.monthlyValue).toFixed(2),
    notes: c.notes ?? "",
  }
}

/** Texto legado a exibir no picker enquanto o papel não tem vínculo. */
function legacyLabel(refs: Contract["techFiscals"]): string | undefined {
  return refs.length > 0 && refs[0].userId === null ? refs[0].name : undefined
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
    setError,
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
    const initial = toFormValues(contract)
    const { managerId, adminFiscalId, techFiscalIds, notes, ...rest } = values

    // Um contrato que já tinha fiscais técnicos vinculados não pode ficar sem
    // nenhum — o backend exige ao menos um.
    if (initial.techFiscalIds.length > 0 && techFiscalIds.length === 0) {
      setError("techFiscalIds", {
        message: "Selecione ao menos um fiscal técnico",
      })
      return
    }

    const input: UpdateContractInput = {
      ...rest,
      notes: notes?.trim() ? notes.trim() : null,
    }

    // Só os papéis efetivamente trocados entram no PATCH: reenviar o mesmo
    // vínculo geraria ruído na auditoria, e papel legado não tocado precisa
    // ficar de fora para o backend preservar o texto.
    if (managerId && managerId !== initial.managerId) {
      input.managerId = managerId
    }
    if (adminFiscalId && adminFiscalId !== initial.adminFiscalId) {
      input.adminFiscalId = adminFiscalId
    }
    if (
      techFiscalIds.length > 0 &&
      !sameIds(techFiscalIds, initial.techFiscalIds)
    ) {
      input.techFiscalIds = techFiscalIds
    }

    updateContract.mutate(
      { contractId: contract.contractId, input },
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
      <Field label="Gestor" error={errors.managerId?.message}>
        <Controller
          control={control}
          name="managerId"
          render={({ field }) => (
            <UserPicker
              role="manager"
              value={field.value}
              onChange={field.onChange}
              legacyName={contract.manager.userId ? undefined : contract.manager.name}
              invalid={!!errors.managerId}
            />
          )}
        />
      </Field>
      <Field label="Fiscal Adm" error={errors.adminFiscalId?.message}>
        <Controller
          control={control}
          name="adminFiscalId"
          render={({ field }) => (
            <UserPicker
              role="adminFiscal"
              value={field.value}
              onChange={field.onChange}
              legacyName={
                contract.adminFiscal.userId
                  ? undefined
                  : contract.adminFiscal.name
              }
              invalid={!!errors.adminFiscalId}
            />
          )}
        />
      </Field>
      <Field
        label="Fiscais Técnicos"
        error={errors.techFiscalIds?.message}
        className="col-span-2"
      >
        <Controller
          control={control}
          name="techFiscalIds"
          render={({ field }) => (
            <UserMultiPicker
              role="techFiscal"
              value={field.value}
              onChange={field.onChange}
              legacyName={legacyLabel(contract.techFiscals)}
              invalid={!!errors.techFiscalIds}
            />
          )}
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
