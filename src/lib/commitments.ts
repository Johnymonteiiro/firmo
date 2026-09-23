import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import { useFeedbackMutation } from "@/lib/feedback"
import type { ReinforcementStatus } from "@/lib/reinforcements"
import {
  decimalSchema,
  processSchema,
  siafiSchema,
  sneSchema,
} from "@/lib/validation"

/**
 * Status derivado do empenho (calculado pelo backend, não persistido):
 * ENCERRADO (saldo zerado) → VIGENTE (ano da SNE = atual) → SALDO (ano
 * anterior com saldo > 0).
 */
export type CommitmentStatus = "VIGENTE" | "SALDO" | "ENCERRADO"

/** Espelha o CommitmentResponseDto (empenho) do backend. */
/** Reforço resumido dentro do empenho — o que a coluna de reforços mostra. */
export interface CommitmentReinforcement {
  reinforcementId: string
  sne: string
  value: string
  reinforcementDate: string
  /** Etapa da tramitação — a listagem mostra a etapa de cada reforço. */
  status: ReinforcementStatus
}

export interface Commitment {
  commitmentId: string
  contractId: string
  contractedCompany: string
  sne: string
  sneDate: string
  processNumber: string
  siafi: string
  initialValue: string
  currentBalance: string
  /** Somatório dos reforços ativos (formatado em BRL pelo backend). */
  reinforcementValue: string
  /** Reforços ativos, do mais recente para o mais antigo. */
  reinforcements: CommitmentReinforcement[]
  status: CommitmentStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Validação do form de criação de empenho (espelha os formatos do backend). */
export const createCommitmentSchema = z.object({
  contractId: z.string().min(1, "Selecione o contrato"),
  sne: sneSchema(),
  sneDate: z.string().min(1, "Informe a data do SNE"),
  processNumber: processSchema(),
  siafi: siafiSchema(),
  initialValue: decimalSchema(),
})

export type CreateCommitmentFormValues = z.infer<typeof createCommitmentSchema>
export type CreateCommitmentInput = CreateCommitmentFormValues

/**
 * Edição do empenho. O contrato não entra: remanejar o empenho para outro
 * contrato mudaria saldo, gestão orçamentária e faturamento de uma vez — e o
 * backend recusa o campo. A empresa entra porque é snapshot do contrato na
 * data do empenho, e pode ter sido gravada errada.
 */
export const updateCommitmentSchema = z.object({
  contractedCompany: z.string().trim().min(1, "Informe a empresa"),
  sne: sneSchema(),
  sneDate: z.string().min(1, "Informe a data do SNE"),
  processNumber: processSchema(),
  siafi: siafiSchema(),
  initialValue: decimalSchema(),
})

export type UpdateCommitmentFormValues = z.infer<typeof updateCommitmentSchema>
export type UpdateCommitmentInput = Partial<UpdateCommitmentFormValues>

export interface ListCommitmentsResponse {
  data: Commitment[]
  total: number
  page: number
  pageSize: number
}

export interface ListCommitmentsParams {
  page?: number
  pageSize?: number
  contractId?: string
  /**
   * Restringe aos empenhos dos contratos em que o usuário ocupa algum papel
   * (RF-U06). Combinado com `contractId`, o backend devolve a intersecção.
   */
  userId?: string
}

export function listCommitments({
  page = 1,
  pageSize = 20,
  contractId,
  userId,
}: ListCommitmentsParams = {}): Promise<ListCommitmentsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (contractId) params.set("contractId", contractId)
  if (userId) params.set("userId", userId)
  return apiFetch<ListCommitmentsResponse>(`/commitments?${params.toString()}`)
}

export function createCommitment(
  input: CreateCommitmentInput
): Promise<{ commitmentId: string }> {
  return apiFetch<{ commitmentId: string }>("/commitments", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateCommitment(
  commitmentId: string,
  input: UpdateCommitmentInput
): Promise<Commitment> {
  return apiFetch<Commitment>(`/commitments/${commitmentId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

/** Status definíveis à mão — SALDO é conclusão do cálculo, não escolha. */
export type CommitmentStatusTarget = "VIGENTE" | "ENCERRADO"

export function changeCommitmentStatus(
  commitmentId: string,
  status: CommitmentStatusTarget
): Promise<Commitment> {
  return apiFetch<Commitment>(`/commitments/${commitmentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

export function archiveCommitment(commitmentId: string): Promise<unknown> {
  return apiFetch(`/commitments/${commitmentId}`, { method: "DELETE" })
}

export function listArchivedCommitments({
  page = 1,
  pageSize = 20,
}: ListCommitmentsParams = {}): Promise<ListCommitmentsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  // NB: o backend usa "archieved" (typo) para empenhos.
  return apiFetch<ListCommitmentsResponse>(
    `/commitments/archieved?${params.toString()}`
  )
}

export function unarchiveCommitment(commitmentId: string): Promise<unknown> {
  return apiFetch(`/commitments/${commitmentId}/unarchive`, { method: "POST" })
}

export const commitmentsKey = ["commitments"] as const
export const commitmentsArchivedKey = ["commitments", "archived"] as const

export function useCommitments(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...commitmentsKey, page, pageSize],
    queryFn: () => listCommitments({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

/** Empenhos dos contratos sob responsabilidade do usuário (RF-U06). */
export function useUserCommitments(userId: string | null, pageSize = 100) {
  return useQuery({
    queryKey: [...commitmentsKey, "byUser", userId, pageSize],
    queryFn: () => listCommitments({ userId: userId as string, pageSize }),
    enabled: !!userId,
  })
}

export function useCreateCommitment() {
  return useFeedbackMutation({
    mutationFn: createCommitment,
    action: "criar",
    entity: "empenho",
    invalidate: [commitmentsKey],
  })
}

export function useUpdateCommitment() {
  return useFeedbackMutation({
    mutationFn: ({
      commitmentId,
      input,
    }: {
      commitmentId: string
      input: UpdateCommitmentInput
    }) => updateCommitment(commitmentId, input),
    action: "editar",
    entity: "empenho",
    // Mudar o valor inicial move o saldo, que a gestão orçamentária e o
    // painel somam por conta própria.
    invalidate: [commitmentsKey, ["budget"], ["dashboard"]],
  })
}

/**
 * Encerrar ou reabrir à mão. O status continua saindo do cálculo (saldo + ano
 * da SNE); isto só liga e desliga a exceção.
 */
export function useChangeCommitmentStatus() {
  return useFeedbackMutation({
    mutationFn: ({
      commitmentId,
      status,
    }: {
      commitmentId: string
      status: CommitmentStatusTarget
    }) => changeCommitmentStatus(commitmentId, status),
    action: "alterar-status",
    entity: "empenho",
    invalidate: [commitmentsKey, ["dashboard"]],
  })
}

export function useArchiveCommitment() {
  return useFeedbackMutation({
    mutationFn: archiveCommitment,
    action: "arquivar",
    entity: "empenho",
    invalidate: [commitmentsKey],
  })
}

export function useArchivedCommitments(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...commitmentsArchivedKey, page, pageSize],
    queryFn: () => listArchivedCommitments({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useUnarchiveCommitment() {
  return useFeedbackMutation({
    mutationFn: unarchiveCommitment,
    action: "desarquivar",
    entity: "empenho",
    invalidate: [commitmentsKey],
  })
}
