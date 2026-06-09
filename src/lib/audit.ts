import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"

export type AuditOperation = "INSERT" | "UPDATE" | "DELETE"
export type AuditEntity =
  | "contract"
  | "commitment"
  | "reinforcement"
  | "billing"

/** Espelha o AuditLogResponseDto do backend. */
export interface AuditLog {
  auditLogId: string
  tabela: string
  operacao: AuditOperation
  alteradoPor: string | null
  dadosAntes: Record<string, unknown> | null
  dadosDepois: Record<string, unknown> | null
  data: string
}

export interface ListHistoryResponse {
  data: AuditLog[]
  total: number
  page: number
  pageSize: number
}

export function listHistory(
  entity: AuditEntity,
  id: string,
  page = 1,
  pageSize = 50
): Promise<ListHistoryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  return apiFetch<ListHistoryResponse>(
    `/audit/${entity}/${id}?${params.toString()}`
  )
}

/** Histórico (antes/depois) de um registro específico. */
export function useHistory(
  entity: AuditEntity,
  id: string | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["audit", entity, id],
    queryFn: () => listHistory(entity, id as string),
    enabled: enabled && !!id,
  })
}
