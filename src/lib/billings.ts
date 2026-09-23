import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import { commitmentsKey } from "@/lib/commitments"
import { useFeedbackMutation } from "@/lib/feedback"
import { optionalProcess, optionalSne, periodSchema } from "@/lib/validation"

/** Uma SNE descontada pelo faturamento (valor já formatado em BRL). */
export interface BillingSne {
  sne: string
  billedAmount: string
}

/** Espelha o BillingResponseDto (faturamento) do backend. */
export interface Billing {
  billingId: string
  contractId: string
  contractedCompany: string
  period: string
  /** SNEs descontadas, na ordem em que foram lançadas. */
  snes: BillingSne[]
  /** Valor Faturado: soma das SNEs (BRL). */
  totalBilledAmount: string
  /** Números dos documentos fiscais. */
  fiscalDocuments: string[]
  /** Valor Economizado CALCULADO: soma do economizado de cada empenho descontado. */
  savedAmount: string | null
  paymentProcessNumber: string | null
  paymentRequestNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** "2026-04" -> "04/2026". */
export function formatPeriod(period: string): string {
  const [year, month] = period.split("-")
  return year && month ? `${month}/${year}` : period
}

export function billingDetailUrl(billingId: string): string {
  return `/dashboard/faturamento/continuados/${billingId}`
}

const DECIMAL = /^\d+(\.\d{1,2})?$/
const MAX_FISCAL_DOCUMENT_LENGTH = 60

const sneLineSchema = z.object({
  sne: z.string().min(1, "Selecione a SNE"),
  billedAmount: z
    .string()
    .refine(
      (v) => DECIMAL.test(v) && Number(v) > 0,
      "Informe um valor maior que zero"
    ),
})

/**
 * A mesma SNE duas vezes seria o mesmo desconto contado em dobro — o backend
 * recusa. A segunda ocorrência é a marcada: a primeira é a que a pessoa já
 * tinha lançado.
 */
const snesSchema = z.array(sneLineSchema).superRefine((lines, ctx) => {
  const seen = new Set<string>()
  lines.forEach((line, index) => {
    if (!line.sne) return
    if (seen.has(line.sne)) {
      ctx.addIssue({
        code: "custom",
        message: "SNE repetida — informe o valor numa linha só",
        path: [index, "sne"],
      })
    }
    seen.add(line.sne)
  })
})

const fiscalDocumentsSchema = z
  .array(
    z.object({
      number: z
        .string()
        .trim()
        .min(1, "Informe o número")
        .max(
          MAX_FISCAL_DOCUMENT_LENGTH,
          `Máximo de ${MAX_FISCAL_DOCUMENT_LENGTH} caracteres`
        ),
    })
  )
  .superRefine((docs, ctx) => {
    const seen = new Set<string>()
    docs.forEach((doc, index) => {
      const number = doc.number.trim()
      if (!number) return
      if (seen.has(number)) {
        ctx.addIssue({
          code: "custom",
          message: "Documento fiscal repetido",
          path: [index, "number"],
        })
      }
      seen.add(number)
    })
  })

/**
 * Um formulário para cadastro e edição. Na edição, contrato e solicitação de
 * pagamento aparecem travados — são imutáveis no backend — e ficam fora do
 * PATCH.
 */
export const billingFormSchema = z.object({
  contractId: z.string().min(1, "Selecione o contrato"),
  period: periodSchema(),
  snes: snesSchema,
  fiscalDocuments: fiscalDocumentsSchema,
  paymentProcessNumber: optionalProcess(),
  paymentRequestNumber: optionalSne("Solicitação", 2000),
  notes: z.string().optional(),
})

export type BillingFormValues = z.infer<typeof billingFormSchema>

export interface BillingSneInput {
  sne: string
  billedAmount: string
}

export interface CreateBillingInput {
  contractId: string
  period: string
  snes: BillingSneInput[]
  fiscalDocuments: string[]
  paymentProcessNumber?: string | null
  paymentRequestNumber?: string | null
  notes?: string | null
}

/** `snes` e `fiscalDocuments` substituem a lista inteira no backend. */
export interface UpdateBillingInput {
  period?: string
  snes?: BillingSneInput[]
  fiscalDocuments?: string[]
  paymentProcessNumber?: string | null
  notes?: string | null
}

export interface ListBillingsResponse {
  data: Billing[]
  total: number
  page: number
  pageSize: number
}

export interface ListBillingsParams {
  page?: number
  pageSize?: number
  contractId?: string
}

export function listBillings({
  page = 1,
  pageSize = 20,
  contractId,
}: ListBillingsParams = {}): Promise<ListBillingsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (contractId) params.set("contractId", contractId)
  return apiFetch<ListBillingsResponse>(`/billings?${params.toString()}`)
}

export function getBilling(billingId: string): Promise<Billing> {
  return apiFetch<Billing>(`/billings/${billingId}`)
}

export function createBilling(
  input: CreateBillingInput
): Promise<{ billingId: string }> {
  return apiFetch<{ billingId: string }>("/billings", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateBilling(
  billingId: string,
  input: UpdateBillingInput
): Promise<Billing> {
  return apiFetch<Billing>(`/billings/${billingId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function archiveBilling(billingId: string): Promise<unknown> {
  return apiFetch(`/billings/${billingId}`, { method: "DELETE" })
}

export function listArchivedBillings({
  page = 1,
  pageSize = 20,
}: ListBillingsParams = {}): Promise<ListBillingsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  return apiFetch<ListBillingsResponse>(
    `/billings/archived?${params.toString()}`
  )
}

export function unarchiveBilling(billingId: string): Promise<unknown> {
  return apiFetch(`/billings/${billingId}/unarchive`, { method: "POST" })
}

export const billingsKey = ["billings"] as const
export const billingsArchivedKey = ["billings", "archived"] as const

/**
 * O faturamento desconta a SNE do empenho: a trigger recalcula o saldo, e as
 * telas que o mostram precisam recarregar junto.
 */
const BILLING_DEPENDENTS = [
  billingsKey,
  commitmentsKey,
  ["budget"],
  ["dashboard"],
] as const

export function useBillings(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...billingsKey, page, pageSize],
    queryFn: () => listBillings({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useBilling(billingId: string | null) {
  return useQuery({
    queryKey: [...billingsKey, "detail", billingId],
    queryFn: () => getBilling(billingId as string),
    enabled: !!billingId,
  })
}

export function useCreateBilling() {
  return useFeedbackMutation({
    mutationFn: createBilling,
    action: "criar",
    entity: "faturamento",
    invalidate: [...BILLING_DEPENDENTS],
  })
}

export function useUpdateBilling() {
  return useFeedbackMutation({
    mutationFn: ({
      billingId,
      input,
    }: {
      billingId: string
      input: UpdateBillingInput
    }) => updateBilling(billingId, input),
    action: "editar",
    entity: "faturamento",
    invalidate: [...BILLING_DEPENDENTS],
  })
}

export function useArchiveBilling() {
  return useFeedbackMutation({
    mutationFn: archiveBilling,
    action: "arquivar",
    entity: "faturamento",
    invalidate: [...BILLING_DEPENDENTS],
  })
}

export function useArchivedBillings(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...billingsArchivedKey, page, pageSize],
    queryFn: () => listArchivedBillings({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useUnarchiveBilling() {
  return useFeedbackMutation({
    mutationFn: unarchiveBilling,
    action: "desarquivar",
    entity: "faturamento",
    invalidate: [...BILLING_DEPENDENTS],
  })
}
