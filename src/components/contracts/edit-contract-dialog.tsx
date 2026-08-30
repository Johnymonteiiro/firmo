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
import { UserMultiPicker } from "@/components/form/user-picker"
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

/** IDs dos responsáveis já vinculados — o legado sem vínculo fica de fora. */
function linkedIds(refs: Contract["techFiscals"]): string[] {
  return refs.map((ref) => ref.userId).filter((id): id is string => id !== null)
}

function toFormValues(c: Contract): UpdateContractFormValues {
  return {
    company: c.company,
    subject: c.subject,
    managerIds: linkedIds(c.managers),
    adminFiscalIds: linkedIds(c.adminFiscals),
    techFiscalIds: linkedIds(c.techFiscals),
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
    const { managerIds, adminFiscalIds, techFiscalIds, notes, ...rest } = values

    // Um papel que já tinha vínculo não pode ficar sem nenhum responsável —
    // o backend exige ao menos um.
    const emptied: Array<[keyof UpdateContractFormValues, string]> = [
      ["managerIds", "Selecione ao menos um gestor"],
      ["adminFiscalIds", "Selecione ao menos um fiscal administrativo"],
      ["techFiscalIds", "Selecione ao menos um fiscal técnico"],
    ]
    for (const [fieldName, message] of emptied) {
      const before = initial[fieldName] as string[]
      const now = values[fieldName] as string[]
      if (before.length > 0 && now.length === 0) {
        setError(fieldName, { message })
        return
      }
    }

    const input: UpdateContractInput = {
      ...rest,
      notes: notes?.trim() ? notes.trim() : null,
    }

    // Só os papéis efetivamente trocados entram no PATCH: reenviar o mesmo
    // vínculo geraria ruído na auditoria, e papel legado não tocado precisa
    // ficar de fora para o backend preservar o texto.
    if (managerIds.length > 0 && !sameIds(managerIds, initial.managerIds)) {
      input.managerIds = managerIds
    }
    if (
      adminFiscalIds.length > 0 &&
      !sameIds(adminFiscalIds, initial.adminFiscalIds)
    ) {
      input.adminFiscalIds = adminFiscalIds
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
      <Field label="Gestores" error={errors.managerIds?.message}>
        <Controller
          control={control}
          name="managerIds"
          render={({ field }) => (
            <UserMultiPicker
              value={field.value}
              onChange={field.onChange}
              legacyName={legacyLabel(contract.managers)}
              invalid={!!errors.managerIds}
              placeholder="Selecione os gestores"
            />
          )}
        />
      </Field>
      <Field label="Fiscais Adm" error={errors.adminFiscalIds?.message}>
        <Controller
          control={control}
          name="adminFiscalIds"
          render={({ field }) => (
            <UserMultiPicker
              value={field.value}
              onChange={field.onChange}
              legacyName={legacyLabel(contract.adminFiscals)}
              invalid={!!errors.adminFiscalIds}
              placeholder="Selecione os fiscais administrativos"
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
              value={field.value}
              onChange={field.onChange}
              legacyName={legacyLabel(contract.techFiscals)}
              invalid={!!errors.techFiscalIds}
              placeholder="Selecione os fiscais técnicos"
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
