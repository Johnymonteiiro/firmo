import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import { commitmentsKey } from "@/lib/commitments"
import { decimalSchema } from "@/lib/validation"

/**
 * Espelha o ReinforcementResponseDto (reforço) do backend.
 * `processNumber` é HERDADO do empenho pai (o reforço não tem processo próprio).
 */
export interface Reinforcement {
  reinforcementId: string
  commitmentId: string
  value: string
  processNumber: string
  reinforcementDate: string
  createdAt: string
  updatedAt: string
  /** Data da anulação (null quando ativo). */
  deletedAt: string | null
}

/** Validação do form de criação de reforço (sem processo nem responsável). */
export const createReinforcementSchema = z.object({
  commitmentId: z.string().min(1, "Selecione o empenho"),
  value: decimalSchema(),
  reinforcementDate: z.string().min(1, "Informe a data do reforço"),
})

export type CreateReinforcementFormValues = z.infer<
  typeof createReinforcementSchema
>
export type CreateReinforcementInput = CreateReinforcementFormValues

export interface ListReinforcementsResponse {
  data: Reinforcement[]
  total: number
  page: number
  pageSize: number
}

export interface ListReinforcementsParams {
  page?: number
  pageSize?: number
  commitmentId?: string
}

export function listReinforcements({
  page = 1,
  pageSize = 20,
  commitmentId,
}: ListReinforcementsParams = {}): Promise<ListReinforcementsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (commitmentId) params.set("commitmentId", commitmentId)
  return apiFetch<ListReinforcementsResponse>(
    `/reinforcements?${params.toString()}`
  )
}

export function createReinforcement(
  input: CreateReinforcementInput
): Promise<{ reinforcementId: string }> {
  return apiFetch<{ reinforcementId: string }>("/reinforcements", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

/**
 * Anula o reforço — DEFINITIVO, sem desfazer. O backend só aceita quando o
 * ano do reforço é anterior ao ano atual (senão 422).
 */
export function annulReinforcement(reinforcementId: string): Promise<unknown> {
  return apiFetch(`/reinforcements/${reinforcementId}`, { method: "DELETE" })
}

export const reinforcementsKey = ["reinforcements"] as const

export function useReinforcements(
  page: number,
  pageSize: number,
  commitmentId?: string
) {
  return useQuery({
    queryKey: [...reinforcementsKey, page, pageSize, commitmentId ?? "all"],
    queryFn: () => listReinforcements({ page, pageSize, commitmentId }),
    placeholderData: (prev) => prev,
  })
}

export function useCreateReinforcement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReinforcement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reinforcementsKey })
      // o reforço altera o saldo/soma do empenho
      queryClient.invalidateQueries({ queryKey: commitmentsKey })
    },
  })
}

export function useAnnulReinforcement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: annulReinforcement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reinforcementsKey })
      queryClient.invalidateQueries({ queryKey: commitmentsKey })
    },
  })
}
