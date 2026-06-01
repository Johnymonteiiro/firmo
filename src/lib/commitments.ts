import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"

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
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Validação do form de criação de empenho (espelha os formatos do backend). */
export const createCommitmentSchema = z.object({
  contractId: z.string().min(1, "Selecione o contrato"),
  sne: z.string().regex(/^\d{9}$/, "Formato esperado: 202600408"),
  sneDate: z.string().min(1, "Informe a data do SNE"),
  processNumber: z
    .string()
    .regex(
      /^\d{5}\.\d{6}\/\d{4}-\d{2}$/,
      "Formato esperado: 23080.003729/2026-38"
    ),
  siafi: z.string().regex(/^\d{4}NE\d{6}$/, "Formato esperado: 2026NE000177"),
  initialValue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Informe um valor válido"),
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

export const commitmentsKey = ["commitments"] as const

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
