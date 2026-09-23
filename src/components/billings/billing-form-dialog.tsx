"use client"

import * as React from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaskedInput } from "@/components/ui/masked-input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/form/combobox"
import { CurrencyInput } from "@/components/form/currency-input"
import { MonthPicker } from "@/components/form/month-picker"
import { FormDialog } from "@/components/form/form-dialog"
import { ProcessInput } from "@/components/form/process-input"
import { Field, FieldError, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  billingFormSchema,
  formatPeriod,
  useBillings,
  useCreateBilling,
  useUpdateBilling,
  type Billing,
  type BillingFormValues,
} from "@/lib/billings"
import { useCommitments } from "@/lib/commitments"
import { useContracts } from "@/lib/contracts"
import { formatBRL, parseBRL } from "@/lib/format"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"

const EMPTY_SNE_LINE = { sne: "", billedAmount: "" }

const emptyForm = (): BillingFormValues => ({
  contractId: "",
  period: "",
  snes: [{ ...EMPTY_SNE_LINE }],
  fiscalDocuments: [],
  paymentProcessNumber: "",
  paymentRequestNumber: "",
  notes: "",
})

function toFormValues(billing: Billing): BillingFormValues {
  return {
    contractId: billing.contractId,
    period: billing.period,
    snes: billing.snes.map((item) => ({
      sne: item.sne,
      billedAmount: parseBRL(item.billedAmount).toFixed(2),
    })),
    fiscalDocuments: billing.fiscalDocuments.map((number) => ({ number })),
    paymentProcessNumber: billing.paymentProcessNumber ?? "",
    paymentRequestNumber: billing.paymentRequestNumber ?? "",
    notes: billing.notes ?? "",
  }
}

const toNull = (v?: string) => (v && v.trim() ? v.trim() : null)

/** Soma em centavos — os valores do form são strings "1500.00". */
function sumLines(lines: Array<{ billedAmount?: string }> | undefined): number {
  const cents = (lines ?? []).reduce(
    (acc, line) => acc + Math.round((Number(line?.billedAmount) || 0) * 100),
    0
  )
  return cents / 100
}

const LINE_GRID = "grid grid-cols-[minmax(0,1fr)_12rem_2.25rem] items-start gap-2"

export interface BillingFormDialogProps {
  /** Ausente: cadastro. Presente: edição deste faturamento. */
  billing?: Billing
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}

/**
 * Cadastro e edição de faturamento no mesmo formulário. Na edição o contrato
 * e a solicitação de pagamento aparecem travados — são imutáveis no backend —
 * e ficam fora do PATCH; SNEs e documentos fiscais vão como lista inteira.
 */
export function BillingFormDialog({
  billing,
  open,
  onOpenChange,
  trigger,
}: BillingFormDialogProps) {
  const createBilling = useCreateBilling()
  const updateBilling = useUpdateBilling()
  const mutation = billing ? updateBilling : createBilling
  const { data: contracts } = useContracts(1, 100)
  const { data: commitments } = useCommitments(1, 100)
  const { data: billings } = useBillings(1, 100)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BillingFormValues>({
    resolver: standardSchemaResolver(billingFormSchema),
    defaultValues: billing ? toFormValues(billing) : emptyForm(),
  })
  const snesField = useFieldArray({ control, name: "snes" })
  const documentsField = useFieldArray({ control, name: "fiscalDocuments" })

  // Recarrega os valores ao abrir — o faturamento pode ter mudado desde então.
  React.useEffect(() => {
    if (open) reset(billing ? toFormValues(billing) : emptyForm())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const [selectedContractId, sneLines] = useWatch({
    control,
    name: ["contractId", "snes"],
  })

  const contractOptions = (contracts?.data ?? []).map((c) => ({
    value: c.contractId,
    label: c.contractNumber,
    description: c.company,
  }))
  const selectedContract = (contracts?.data ?? []).find(
    (c) => c.contractId === selectedContractId
  )

  // SNEs de desconto = empenhos do contrato selecionado.
  const contractCommitments = (commitments?.data ?? []).filter(
    (c) => !selectedContractId || c.contractId === selectedContractId
  )
  const selectedSnes = (sneLines ?? [])
    .map((line) => line?.sne)
    .filter((sne): sne is string => !!sne)

  /** Cada linha oferece a própria SNE e as que as outras linhas não usaram. */
  const sneOptionsFor = (index: number) =>
    contractCommitments
      .filter(
        (c) => c.sne === sneLines?.[index]?.sne || !selectedSnes.includes(c.sne)
      )
      .map((c) => ({
        value: c.sne,
        label: c.sne,
        description: `Saldo ${c.currentBalance}`,
      }))

  // Regra GFC (alerta, não bloqueio): ao faturar numa SNE do ano corrente,
  // avisar se o contrato ainda tem empenho antigo com saldo (status SALDO).
  const usingCurrentSne = selectedSnes.some(
    (sne) => contractCommitments.find((c) => c.sne === sne)?.status === "VIGENTE"
  )
  const oldSnesWithBalance = contractCommitments.filter(
    (c) => c.status === "SALDO" && !selectedSnes.includes(c.sne)
  )
  const showOldSneWarning = usingCurrentSne && oldSnesWithBalance.length > 0

  // O que o contrato já faturou nas outras competências, para a pessoa ver o
  // total do contrato com este lançamento antes de salvar.
  const linesTotal = sumLines(sneLines)
  const otherBillings = (billings?.data ?? []).filter(
    (b) =>
      b.contractId === selectedContractId && b.billingId !== billing?.billingId
  )
  const otherTotal = otherBillings.reduce(
    (acc, b) => acc + parseBRL(b.totalBilledAmount),
    0
  )

  function onSubmit(values: BillingFormValues) {
    const snes = values.snes.map((line) => ({
      sne: line.sne,
      billedAmount: line.billedAmount,
    }))
    const fiscalDocuments = values.fiscalDocuments.map((doc) =>
      doc.number.trim()
    )

    if (billing) {
      updateBilling.mutate(
        {
          billingId: billing.billingId,
          input: {
            period: values.period,
            snes,
            fiscalDocuments,
            paymentProcessNumber: toNull(values.paymentProcessNumber),
            notes: toNull(values.notes),
          },
        },
        { onSuccess: () => onOpenChange(false) }
      )
      return
    }

    createBilling.mutate(
      {
        contractId: values.contractId,
        period: values.period,
        snes,
        fiscalDocuments,
        paymentProcessNumber: toNull(values.paymentProcessNumber),
        paymentRequestNumber: toNull(values.paymentRequestNumber),
        notes: toNull(values.notes),
      },
      {
        onSuccess: () => {
          reset(emptyForm())
          onOpenChange(false)
        },
      }
    )
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Não foi possível salvar o faturamento."
        : null

  const snesError = errors.snes?.root?.message ?? errors.snes?.message

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={
        billing
          ? `Editar Faturamento ${formatPeriod(billing.period)}`
          : "Novo Faturamento"
      }
      formId={billing ? `edit-billing-${billing.billingId}` : "new-billing-form"}
      onSubmit={handleSubmit(onSubmit)}
      isPending={mutation.isPending}
      errorMessage={errorMessage}
      trigger={trigger}
    >
      <SectionTitle>Vínculo</SectionTitle>
      {/* Contrato e competência dividem a linha: juntos são a identidade do
          faturamento, e a pessoa escolhe os dois de uma vez. */}
      <Field label="Contrato" error={errors.contractId?.message}>
        {billing ? (
          <Input
            value={
              selectedContract
                ? `${selectedContract.contractNumber} · ${selectedContract.company}`
                : billing.contractedCompany
            }
            disabled
            readOnly
          />
        ) : (
          <Controller
            control={control}
            name="contractId"
            render={({ field }) => (
              <Combobox
                options={contractOptions}
                value={field.value}
                onChange={(value) => {
                  // SNE é do empenho de um contrato: trocar o contrato
                  // invalida as linhas já escolhidas.
                  if (value !== field.value) {
                    snesField.replace([{ ...EMPTY_SNE_LINE }])
                  }
                  field.onChange(value)
                }}
                onBlur={field.onBlur}
                placeholder="Selecione o contrato"
                searchPlaceholder="Buscar por nº ou empresa..."
                emptyText="Nenhum contrato encontrado."
                aria-invalid={!!errors.contractId}
              />
            )}
          />
        )}
      </Field>

      <Field label="Competência" error={errors.period?.message}>
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

      <SectionTitle>SNEs descontadas</SectionTitle>
      <div className="col-span-2 flex flex-col gap-2">
        {snesField.fields.length > 0 ? (
          <div className={`${LINE_GRID} text-sm font-medium`}>
            <span>SNE</span>
            <span>Valor Faturado (R$)</span>
            <span className="sr-only">Remover</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma SNE — o faturamento não desconta empenho.
          </p>
        )}

        {snesField.fields.map((line, index) => (
          <div key={line.id} className={LINE_GRID}>
            <div className="flex flex-col gap-1">
              <Controller
                control={control}
                name={`snes.${index}.sne`}
                render={({ field }) => (
                  <Combobox
                    options={sneOptionsFor(index)}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Selecione o empenho (SNE)"
                    searchPlaceholder="Buscar SNE..."
                    emptyText="Nenhum empenho disponível para o contrato."
                    aria-invalid={!!errors.snes?.[index]?.sne}
                  />
                )}
              />
              <FieldError message={errors.snes?.[index]?.sne?.message} />
            </div>
            <div className="flex flex-col gap-1">
              <Controller
                control={control}
                name={`snes.${index}.billedAmount`}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-invalid={!!errors.snes?.[index]?.billedAmount}
                  />
                )}
              />
              <FieldError
                message={errors.snes?.[index]?.billedAmount?.message}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remover SNE"
              onClick={() => snesField.remove(index)}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            </Button>
          </div>
        ))}
        <FieldError message={snesError} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => snesField.append({ ...EMPTY_SNE_LINE })}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Adicionar SNE
          </Button>
          <span className="text-sm">
            Total deste faturamento:{" "}
            <span className="font-mono font-medium tabular-nums">
              {formatBRL(linesTotal)}
            </span>
          </span>
        </div>

        {selectedContractId ? (
          <p className="text-right text-xs text-muted-foreground">
            Total faturado no contrato com este lançamento:{" "}
            <span className="font-mono tabular-nums">
              {formatBRL(otherTotal + linesTotal)}
            </span>{" "}
            ({otherBillings.length === 1
              ? "1 outra competência"
              : `${otherBillings.length} outras competências`}
            : {formatBRL(otherTotal)})
          </p>
        ) : null}
      </div>

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

      <SectionTitle>Documentos fiscais</SectionTitle>
      <div className="col-span-2 flex flex-col gap-2">
        {documentsField.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum documento fiscal informado.
          </p>
        ) : null}
        {documentsField.fields.map((doc, index) => (
          <div
            key={doc.id}
            className="grid grid-cols-[minmax(0,1fr)_2.25rem] items-start gap-2"
          >
            <div className="flex flex-col gap-1">
              <Input
                placeholder="Número do documento fiscal"
                aria-invalid={!!errors.fiscalDocuments?.[index]?.number}
                {...register(`fiscalDocuments.${index}.number`)}
              />
              <FieldError
                message={errors.fiscalDocuments?.[index]?.number?.message}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remover documento fiscal"
              onClick={() => documentsField.remove(index)}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            </Button>
          </div>
        ))}
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => documentsField.append({ number: "" })}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Adicionar documento fiscal
          </Button>
        </div>
      </div>

      {/* "Economia" (Valor Economizado) é calculada pelo sistema. */}
      <SectionTitle>Pagamento</SectionTitle>
      <Field
        label="Solicitação de Pagamento"
        error={errors.paymentRequestNumber?.message}
      >
        {billing ? (
          <Input
            value={billing.paymentRequestNumber ?? "—"}
            disabled
            readOnly
          />
        ) : (
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
        )}
      </Field>
      <Field
        label="Processo de Pagamento"
        error={errors.paymentProcessNumber?.message}
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
