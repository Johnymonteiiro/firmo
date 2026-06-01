import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"

/** Espelha o ReinforcementResponseDto (reforço) do backend. */
export interface Reinforcement {
  reinforcementId: string
  commitmentId: string
  value: string
  processNumber: string
  reinforcementDate: string
  reinforcedBy: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Validação do form de criação de reforço. */
export const createReinforcementSchema = z.object({
  commitmentId: z.string().min(1, "Selecione o empenho"),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, "Informe um valor válido"),
  processNumber: z
    .string()
    .regex(
      /^\d{5}\.\d{6}\/\d{4}-\d{2}$/,
      "Formato esperado: 23080.003729/2026-38"
    ),
  reinforcementDate: z.string().min(1, "Informe a data do reforço"),
  reinforcedBy: z.string().trim().min(1, "Informe quem reforçou"),
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

export const reinforcementsKey = ["reinforcements"] as const

export function useReinforcements(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...reinforcementsKey, page, pageSize],
    queryFn: () => listReinforcements({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useCreateReinforcement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReinforcement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reinforcementsKey })
    },
  })
}
