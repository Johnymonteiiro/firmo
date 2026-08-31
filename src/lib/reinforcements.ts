import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import { commitmentsKey } from "@/lib/commitments"
import { useFeedbackMutation } from "@/lib/feedback"
import { decimalSchema } from "@/lib/validation"

/**
 * Espelha o ReinforcementResponseDto (reforço) do backend.
 * `processNumber` é HERDADO do empenho pai (o reforço não tem processo próprio).
 */
/**
 * Etapa de tramitação do reforço. O fluxo anda uma casa por vez e para frente;
 * voltar (ou pular) exige `reforcos:retroceder_status`.
 */
export type ReinforcementStatus = "DGER" | "SE_DCF" | "CONCLUIDO"

export const REINFORCEMENT_STATUS_FLOW: ReinforcementStatus[] = [
  "DGER",
  "SE_DCF",
  "CONCLUIDO",
]

export const REINFORCEMENT_STATUS_LABEL: Record<ReinforcementStatus, string> = {
  DGER: "DGER",
  SE_DCF: "SE/DCF",
  CONCLUIDO: "Concluído",
}

/** Próxima etapa do fluxo, ou `null` quando já está na última. */
export function nextReinforcementStatus(
  current: ReinforcementStatus
): ReinforcementStatus | null {
  const index = REINFORCEMENT_STATUS_FLOW.indexOf(current)
  return REINFORCEMENT_STATUS_FLOW[index + 1] ?? null
}

export interface Reinforcement {
  reinforcementId: string
  commitmentId: string
  /** SNE própria do reforço — única dentro do empenho. */
  sne: string
  value: string
  processNumber: string
  reinforcementDate: string
  status: ReinforcementStatus
  createdAt: string
  updatedAt: string
  /** Data da anulação (null quando ativo). */
  deletedAt: string | null
}

/** Validação do form de criação de reforço (sem processo nem responsável). */
export const createReinforcementSchema = z.object({
  commitmentId: z.string().min(1, "Selecione o empenho"),
  sne: z
    .string()
    .trim()
    .min(1, "Informe a SNE do reforço")
    .max(30, "SNE: no máximo 30 caracteres"),
  value: decimalSchema(),
  reinforcementDate: z.string().min(1, "Informe a data do reforço"),
})

export type CreateReinforcementFormValues = z.infer<
  typeof createReinforcementSchema
>
export type CreateReinforcementInput = CreateReinforcementFormValues

/**
 * O que a tela de edição precisa saber de um reforço.
 *
 * Existe porque o formulário é aberto de dois lugares: do painel de reforços,
 * que tem o `Reinforcement` inteiro, e da listagem de empenhos, onde o reforço
 * vem resumido dentro do empenho e o processo é o do empenho pai. Pedir o
 * objeto completo obrigaria a listagem a buscar cada reforço só para editar.
 */
export type EditableReinforcement = Pick<
  Reinforcement,
  "reinforcementId" | "sne" | "value" | "reinforcementDate" | "status"
> & { processNumber: string }

/** Edição do reforço: sem empenho (é outro registro) e sem etapa (rota própria). */
export const updateReinforcementSchema = createReinforcementSchema.omit({
  commitmentId: true,
})

export type UpdateReinforcementFormValues = z.infer<
  typeof updateReinforcementSchema
>
export type UpdateReinforcementInput = Partial<UpdateReinforcementFormValues>

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

export function updateReinforcement(
  reinforcementId: string,
  input: UpdateReinforcementInput
): Promise<Reinforcement> {
  return apiFetch<Reinforcement>(`/reinforcements/${reinforcementId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function changeReinforcementStatus(
  reinforcementId: string,
  status: ReinforcementStatus
): Promise<Reinforcement> {
  return apiFetch<Reinforcement>(`/reinforcements/${reinforcementId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
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
  return useFeedbackMutation({
    mutationFn: createReinforcement,
    action: "criar",
    entity: "reforço",
    // O reforço entra no saldo do empenho — a listagem de empenhos mostra a
    // soma e a SNE do mais recente.
    invalidate: [reinforcementsKey, commitmentsKey],
  })
}

export function useUpdateReinforcement() {
  return useFeedbackMutation({
    mutationFn: ({
      reinforcementId,
      input,
    }: {
      reinforcementId: string
      input: UpdateReinforcementInput
    }) => updateReinforcement(reinforcementId, input),
    action: "editar",
    entity: "reforço",
    invalidate: [reinforcementsKey, commitmentsKey, ["budget"], ["dashboard"]],
  })
}

export function useChangeReinforcementStatus() {
  return useFeedbackMutation({
    mutationFn: ({
      reinforcementId,
      status,
    }: {
      reinforcementId: string
      status: ReinforcementStatus
    }) => changeReinforcementStatus(reinforcementId, status),
    action: "alterar-status",
    entity: "reforço",
    invalidate: [reinforcementsKey, commitmentsKey],
  })
}

export function useAnnulReinforcement() {
  return useFeedbackMutation({
    mutationFn: annulReinforcement,
    action: "anular",
    entity: "reforço",
    invalidate: [reinforcementsKey, commitmentsKey, ["budget"], ["dashboard"]],
  })
}
