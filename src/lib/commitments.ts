import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
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
  status: CommitmentStatus
  /** Valor Economizado calculado: (inicial + reajuste do contrato) − faturado. */
  savedAmount: string
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
}

export function listCommitments({
  page = 1,
  pageSize = 20,
  contractId,
}: ListCommitmentsParams = {}): Promise<ListCommitmentsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (contractId) params.set("contractId", contractId)
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

export function useCreateCommitment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCommitment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commitmentsKey })
    },
  })
}

export function useArchiveCommitment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archiveCommitment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commitmentsKey })
    },
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unarchiveCommitment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commitmentsKey })
    },
  })
}
