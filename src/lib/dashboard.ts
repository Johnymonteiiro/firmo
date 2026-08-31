import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { ReinforcementStatus } from "@/lib/reinforcements"

/**
 * Painel geral. Diferente do resto da API, este endpoint devolve **número**
 * (em reais), não texto em BRL — quem consome são gráficos, e desfazer a
 * formatação para desenhar seria trabalho inútil e frágil.
 *
 * Blocos que a sessão não pode ver simplesmente **não vêm**: a ausência da
 * chave é o gate, e é a única fonte que não diverge do backend.
 */

export type ContractDisplayStatus =
  | "VIGENTE"
  | "A_VENCER"
  | "EXPIRADO"
  | "ENCERRADO"

export type CommitmentDerivedStatus = "VIGENTE" | "SALDO" | "ENCERRADO"

export interface ContractHighlight {
  contractId: string
  contractNumber: string
  company: string
  status: ContractDisplayStatus
  monthlyValue: number
  expiresAt: string
  daysRemaining: number
}

export interface ContractsBlock {
  total: number
  byStatus: Record<ContractDisplayStatus, number>
  byDueBucket: { ate30: number; ate60: number; ate90: number; acima90: number }
  monthlyValueTotal: number
  annualCostTotal: number
  expiringSoon: ContractHighlight[]
  topByMonthlyValue: ContractHighlight[]
}

export interface CommitmentByContract {
  contractId: string
  contractNumber: string
  company: string
  released: number
  balance: number
}

export interface CommitmentHighlight {
  commitmentId: string
  contractNumber: string
  company: string
  sne: string
  released: number
  balance: number
  /** 0 = intacto, 1 = esgotado. */
  consumedRatio: number
}

export interface CommitmentsBlock {
  total: number
  byStatus: Record<CommitmentDerivedStatus, number>
  initialTotal: number
  reinforcementTotal: number
  balanceTotal: number
  byContract: CommitmentByContract[]
  lowBalance: CommitmentHighlight[]
}

export interface MonthlyPoint {
  month: number
  competence: string
  billed: number
}

export interface DashboardResponse {
  year: number
  referenceDate: string
  calculatedAt: string
  /** 12 posições, ou vazio quando a sessão não pode ver faturamentos. */
  monthly: MonthlyPoint[]
  contracts?: ContractsBlock
  commitments?: CommitmentsBlock
  budget?: {
    annualCost: number
    releasedBudget: number
    commitmentsBalance: number
    totalSaved: number
  }
  nonContinuous?: {
    creditorCount: number
    byYear: Array<{
      year: number
      committed: number
      paid: number
      balance: number
    }>
  }
  /** Reforços que ainda não fecharam a tramitação — alimentam o sino. */
  reinforcements?: {
    pending: Array<{
      reinforcementId: string
      sne: string
      contractNumber: string
      company: string
      status: ReinforcementStatus
      daysInStatus: number
    }>
  }
  users?: {
    total: number
    byStatus: { ATIVO: number; INATIVO: number; SUSPENSO: number }
  }
}

export function getDashboard(params: { year?: number } = {}) {
  const search = new URLSearchParams()
  if (params.year !== undefined) search.set("year", String(params.year))
  const query = search.toString()
  return apiFetch<DashboardResponse>(`/dashboard${query ? `?${query}` : ""}`)
}

export const dashboardKey = ["dashboard"] as const

export function useDashboard(year: number) {
  return useQuery({
    queryKey: [...dashboardKey, year],
    queryFn: () => getDashboard({ year }),
    placeholderData: (prev) => prev,
    // O provider global usa `staleTime: 0` + refetch ao focar a janela, o que
    // recarregaria o painel inteiro a cada troca de aba do navegador.
    staleTime: 60_000,
  })
}

/** Nome curto do mês, para os eixos ("jan", "fev"…). */
export function monthLabel(month: number): string {
  return new Date(Date.UTC(2000, month - 1, 1))
    .toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" })
    .replace(".", "")
}
