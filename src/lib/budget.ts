import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"

/**
 * Gestão Orçamentária (aba GO da planilha): uma linha por contrato continuado
 * do ano. Tudo é derivado no backend — a tela não escreve nada.
 */

/** Status persistido do contrato; `EXPIRADO` é derivado da vigência. */
export type BudgetStatus = "VIGENTE" | "ENCERRADO" | "EXPIRADO"

/** Só estes filtram no backend — `EXPIRADO` não existe como coluna. */
export type BudgetStatusFilter = "VIGENTE" | "ENCERRADO"

/** Espelha o BudgetLineResponseDto — valores já em BRL. */
export interface BudgetLine {
  contractId: string
  contractNumber: string
  company: string
  status: BudgetStatus
  annualCost: string
  requiredBudget: string
  releasedBudget: string
  commitmentsBalance: string
  disallowances: string
  totalSaved: string
}

export interface BudgetTotals {
  annualCost: string
  releasedBudget: string
  commitmentsBalance: string
  totalSaved: string
}

export interface BudgetOverviewResponse {
  data: BudgetLine[]
  total: number
  page: number
  pageSize: number
  year: number
  /** Soma do recorte inteiro, não só da página. */
  totals: BudgetTotals
  calculatedAt: string
}

export interface BudgetOverviewParams {
  year?: number
  page?: number
  pageSize?: number
  status?: BudgetStatusFilter
  search?: string
  /** Restringe aos contratos sob responsabilidade do usuário (RF-U06). */
  userId?: string
}

export function getBudgetOverview({
  year,
  page = 1,
  pageSize = 100,
  status,
  search,
  userId,
}: BudgetOverviewParams = {}): Promise<BudgetOverviewResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (year !== undefined) params.set("year", String(year))
  if (status) params.set("status", status)
  if (search) params.set("search", search)
  if (userId) params.set("userId", userId)

  return apiFetch<BudgetOverviewResponse>(`/budget?${params.toString()}`)
}

export const budgetKey = ["budget"] as const

export function useBudgetOverview(year: number) {
  return useQuery({
    queryKey: [...budgetKey, year],
    queryFn: () => getBudgetOverview({ year }),
    placeholderData: (prev) => prev,
  })
}

/**
 * Anos oferecidos no seletor: do próximo ao de cinco anos atrás. O relatório é
 * sempre de um ano fechado, e não há endpoint que liste em quais anos existe
 * contrato — este intervalo cobre o histórico que a planilha traz.
 */
export function budgetYearOptions(reference = new Date().getFullYear()) {
  return Array.from({ length: 7 }, (_, index) => reference + 1 - index)
}
