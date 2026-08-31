import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import { useFeedbackMutation } from "@/lib/feedback"

/**
 * Contratos NÃO continuados — compras e serviços avulsos (abas REMP e REP da
 * planilha). O eixo é o **credor**: um registro é credor + objeto + ano, e o
 * razão pendura empenhos e pagamentos nele.
 */

const MIN_YEAR = 1990
const MAX_YEAR = 2100

/** Verificador opcional — a planilha tem processos sem ele. */
const PROCESS_NC = /^23080\.\d{6}\/\d{4}(-\d{2})?$/

export type MovementQualification = "EMPENHO" | "PAGAMENTO"

/** Espelha o CreditorResponseDto do backend. */
export interface Creditor {
  creditorId: string
  creditor: string
  object: string
  year: number
  /** Σ empenhos − Σ pagamentos, já em BRL. */
  currentBalance: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Totais do recorte devolvidos junto da listagem (RF-NC13). */
export interface CreditorTotals {
  committed: string
  paid: string
  balance: string
}

/** Espelha o MovementResponseDto do backend. */
export interface Movement {
  movementId: string
  creditorId: string
  issueDate: string
  year: number
  sequentialNumber: string
  processNumber: string
  qualification: MovementQualification
  value: string
  paymentDate: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// ─────────────────────────────────────────────────────────────
// Schemas de formulário
// ─────────────────────────────────────────────────────────────

/**
 * O ano é digitado como texto (o campo tem máscara de 4 dígitos) e chega à API
 * como número. Declarar a conversão explicitamente — em vez de `z.coerce` —
 * mantém o tipo de ENTRADA do schema igual ao que o formulário realmente
 * guarda; com `coerce` a entrada vira `unknown` e o resolver do
 * react-hook-form deixa de casar com o formulário.
 */
const yearField = z
  .string()
  .trim()
  .min(1, "Informe o ano")
  .regex(/^\d{4}$/, "O ano tem 4 dígitos")
  .transform(Number)
  .refine(
    (year) => year >= MIN_YEAR && year <= MAX_YEAR,
    `Ano inválido — esperado entre ${MIN_YEAR} e ${MAX_YEAR}.`
  )

export const creditorSchema = z.object({
  creditor: z
    .string()
    .trim()
    .min(1, "Informe o credor")
    .max(200, "Máximo de 200 caracteres"),
  object: z
    .string()
    .trim()
    .min(1, "Informe o objeto")
    .max(200, "Máximo de 200 caracteres"),
  year: yearField,
})

/** O que o formulário manipula (ano como texto). */
export type CreditorFormValues = z.input<typeof creditorSchema>
/** O que sai da validação e vai para a API (ano como número). */
export type CreditorFormOutput = z.output<typeof creditorSchema>
export type CreateCreditorInput = CreditorFormOutput
export type UpdateCreditorInput = Partial<CreditorFormOutput>

/**
 * O par qualificação × data de pagamento é a RN-NC05: pagamento exige a data,
 * empenho não a aceita. Validar aqui evita o 400 do backend e deixa a
 * mensagem no campo certo do formulário.
 */
export const movementSchema = z
  .object({
    creditorId: z.string().min(1, "Selecione o credor"),
    issueDate: z.string().min(1, "Informe a data de emissão"),
    sequentialNumber: z
      .string()
      .trim()
      .min(1, "Informe o sequencial")
      .max(30, "Máximo de 30 caracteres"),
    processNumber: z
      .string()
      .regex(
        PROCESS_NC,
        "Processo: formato 23080.007668/2023-35 (verificador opcional)."
      ),
    qualification: z.enum(["EMPENHO", "PAGAMENTO"], {
      message: "Selecione a qualificação",
    }),
    value: z.string().regex(/^\d+(\.\d{1,2})?$/, "Informe um valor válido"),
    /** String vazia = não informada; o fetcher converte para null. */
    paymentDate: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.qualification === "PAGAMENTO" && !values.paymentDate) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentDate"],
        message: "Obrigatória para pagamento",
      })
    }
    if (values.qualification === "EMPENHO" && values.paymentDate) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentDate"],
        message: "Não se aplica a empenho",
      })
    }
    if (
      values.paymentDate &&
      values.issueDate &&
      values.paymentDate < values.issueDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentDate"],
        message: "Não pode ser anterior à emissão",
      })
    }
  })

export type MovementFormValues = z.infer<typeof movementSchema>

export interface CreateMovementInput {
  creditorId: string
  issueDate: string
  sequentialNumber: string
  processNumber: string
  qualification: MovementQualification
  value: string
  paymentDate: string | null
}

export type UpdateMovementInput = Partial<Omit<CreateMovementInput, "creditorId">>

// ─────────────────────────────────────────────────────────────
// Fetchers — credores
// ─────────────────────────────────────────────────────────────

export interface ListCreditorsResponse {
  data: Creditor[]
  total: number
  page: number
  pageSize: number
  totals: CreditorTotals
}

export interface ListCreditorsParams {
  page?: number
  pageSize?: number
  year?: number
  search?: string
}

const creditorQuery = ({
  page = 1,
  pageSize = 20,
  year,
  search,
}: ListCreditorsParams): string => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (year !== undefined) params.set("year", String(year))
  if (search) params.set("search", search)
  return params.toString()
}

export function listCreditors(
  params: ListCreditorsParams = {}
): Promise<ListCreditorsResponse> {
  return apiFetch<ListCreditorsResponse>(
    `/non-continuous/creditors?${creditorQuery(params)}`
  )
}

export function listArchivedCreditors(
  params: ListCreditorsParams = {}
): Promise<Omit<ListCreditorsResponse, "totals">> {
  return apiFetch<Omit<ListCreditorsResponse, "totals">>(
    `/non-continuous/creditors/archived?${creditorQuery(params)}`
  )
}

export function createCreditor(
  input: CreateCreditorInput
): Promise<{ creditorId: string }> {
  return apiFetch<{ creditorId: string }>("/non-continuous/creditors", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateCreditor(
  creditorId: string,
  input: UpdateCreditorInput
): Promise<unknown> {
  return apiFetch(`/non-continuous/creditors/${creditorId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function archiveCreditor(creditorId: string): Promise<unknown> {
  return apiFetch(`/non-continuous/creditors/${creditorId}`, {
    method: "DELETE",
  })
}

export function unarchiveCreditor(creditorId: string): Promise<unknown> {
  return apiFetch(`/non-continuous/creditors/${creditorId}/unarchive`, {
    method: "POST",
  })
}

// ─────────────────────────────────────────────────────────────
// Fetchers — movimentos
// ─────────────────────────────────────────────────────────────

export interface ListMovementsResponse {
  data: Movement[]
  total: number
  page: number
  pageSize: number
}

export interface ListMovementsParams {
  page?: number
  pageSize?: number
  creditorId?: string
  year?: number
  qualification?: MovementQualification
}

const movementQuery = ({
  page = 1,
  pageSize = 20,
  creditorId,
  year,
  qualification,
}: ListMovementsParams): string => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (creditorId) params.set("creditorId", creditorId)
  if (year !== undefined) params.set("year", String(year))
  if (qualification) params.set("qualification", qualification)
  return params.toString()
}

export function listMovements(
  params: ListMovementsParams = {}
): Promise<ListMovementsResponse> {
  return apiFetch<ListMovementsResponse>(
    `/non-continuous/movements?${movementQuery(params)}`
  )
}

export function listArchivedMovements(
  params: ListMovementsParams = {}
): Promise<ListMovementsResponse> {
  return apiFetch<ListMovementsResponse>(
    `/non-continuous/movements/archived?${movementQuery(params)}`
  )
}

export function createMovement(
  input: CreateMovementInput
): Promise<{ movementId: string }> {
  return apiFetch<{ movementId: string }>("/non-continuous/movements", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateMovement(
  movementId: string,
  input: UpdateMovementInput
): Promise<unknown> {
  return apiFetch(`/non-continuous/movements/${movementId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function archiveMovement(movementId: string): Promise<unknown> {
  return apiFetch(`/non-continuous/movements/${movementId}`, {
    method: "DELETE",
  })
}

export function unarchiveMovement(movementId: string): Promise<unknown> {
  return apiFetch(`/non-continuous/movements/${movementId}/unarchive`, {
    method: "POST",
  })
}

// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────

export const creditorsKey = ["non-continuous", "creditors"] as const
export const creditorsArchivedKey = [
  "non-continuous",
  "creditors",
  "archived",
] as const
export const movementsKey = ["non-continuous", "movements"] as const
export const movementsArchivedKey = [
  "non-continuous",
  "movements",
  "archived",
] as const

export function useCreditors(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...creditorsKey, page, pageSize],
    queryFn: () => listCreditors({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useArchivedCreditors(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...creditorsArchivedKey, page, pageSize],
    queryFn: () => listArchivedCreditors({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useMovements(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...movementsKey, page, pageSize],
    queryFn: () => listMovements({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useArchivedMovements(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...movementsArchivedKey, page, pageSize],
    queryFn: () => listArchivedMovements({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

/**
 * Toda mutação aqui atravessa as duas listagens: mexer num movimento muda o
 * saldo do credor (trigger no banco), e arquivar/desarquivar move a linha entre
 * a lista ativa e a de arquivados. Invalidar o prefixo inteiro é mais barato do
 * que rastrear qual das quatro chaves ficou obsoleta.
 */
/**
 * Toda escrita de não continuados invalida a mesma raiz: credor e movimento
 * compartilham saldo, e o painel soma os dois.
 */
const NC_KEYS = [["non-continuous"], ["dashboard"]]

export function useCreateCreditor() {
  return useFeedbackMutation({
    mutationFn: createCreditor,
    action: "criar",
    entity: "credor",
    invalidate: NC_KEYS,
  })
}

export function useUpdateCreditor() {
  return useFeedbackMutation({
    mutationFn: ({
      creditorId,
      input,
    }: {
      creditorId: string
      input: UpdateCreditorInput
    }) => updateCreditor(creditorId, input),
    action: "editar",
    entity: "credor",
    invalidate: NC_KEYS,
  })
}

export function useArchiveCreditor() {
  return useFeedbackMutation({
    mutationFn: archiveCreditor,
    action: "arquivar",
    entity: "credor",
    invalidate: NC_KEYS,
  })
}

export function useUnarchiveCreditor() {
  return useFeedbackMutation({
    mutationFn: unarchiveCreditor,
    action: "desarquivar",
    entity: "credor",
    invalidate: NC_KEYS,
  })
}

export function useCreateMovement() {
  return useFeedbackMutation({
    mutationFn: createMovement,
    action: "criar",
    entity: "movimento",
    invalidate: NC_KEYS,
  })
}

export function useUpdateMovement() {
  return useFeedbackMutation({
    mutationFn: ({
      movementId,
      input,
    }: {
      movementId: string
      input: UpdateMovementInput
    }) => updateMovement(movementId, input),
    action: "editar",
    entity: "movimento",
    invalidate: NC_KEYS,
  })
}

export function useArchiveMovement() {
  return useFeedbackMutation({
    mutationFn: archiveMovement,
    action: "arquivar",
    entity: "movimento",
    invalidate: NC_KEYS,
  })
}

export function useUnarchiveMovement() {
  return useFeedbackMutation({
    mutationFn: unarchiveMovement,
    action: "desarquivar",
    entity: "movimento",
    invalidate: NC_KEYS,
  })
}
