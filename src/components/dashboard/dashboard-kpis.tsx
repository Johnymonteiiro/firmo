"use client"

import { KpiCard, KpiGrid, type KpiDelta } from "@/components/kpi"
import { formatBRL } from "@/lib/format"
import { monthLabel, type DashboardResponse } from "@/lib/dashboard"
import {
  MoneySend01Icon,
  Coins01Icon,
  ContractsIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

/**
 * Variação do faturamento contra o mês anterior. É o **único** indicador do
 * painel com delta: é o único em que existe base de comparação real — o banco
 * não guarda histórico de contratos nem de saldos.
 */
function billingDelta(
  monthly: DashboardResponse["monthly"],
  month: number
): KpiDelta | undefined {
  if (month < 2 || monthly.length < month) return undefined

  const current = monthly[month - 1].billed
  const previous = monthly[month - 2].billed
  const label = monthLabel(month - 1)

  if (previous === 0) {
    return current === 0
      ? { text: `sem faturamento em ${label}`, direction: "flat" }
      : { text: `nada faturado em ${label}`, direction: "up" }
  }

  const change = ((current - previous) / previous) * 100
  if (Math.abs(change) < 0.05) {
    return { text: `estável vs. ${label}`, direction: "flat" }
  }

  return {
    text: `${change > 0 ? "+" : "−"}${Math.abs(change).toFixed(1)}% vs. ${label}`,
    direction: change > 0 ? "up" : "down",
  }
}

export function DashboardKpis({
  data,
  isLoading,
}: {
  data?: DashboardResponse
  isLoading?: boolean
}) {
  const contracts = data?.contracts
  const commitments = data?.commitments
  const month = data ? new Date(data.referenceDate).getUTCMonth() + 1 : 1
  const billedThisMonth = data?.monthly[month - 1]?.billed

  const emVigor = contracts
    ? contracts.byStatus.VIGENTE + contracts.byStatus.A_VENCER
    : 0
  const aVencer = contracts?.byStatus.A_VENCER ?? 0

  const released = commitments
    ? commitments.initialTotal + commitments.reinforcementTotal
    : 0

  return (
    <KpiGrid>
      {contracts ? (
        <>
          <KpiCard
            label="Contratos vigentes"
            value={emVigor}
            hint={
              aVencer > 0
                ? `${aVencer} a vencer em até 60 dias`
                : `${contracts.total} no exercício`
            }
            icon={ContractsIcon}
            tone={aVencer > 0 ? "warning" : "info"}
            isLoading={isLoading}
          />
          <KpiCard
            label="Custo mensal contratado"
            value={formatBRL(contracts.monthlyValueTotal)}
            hint={`${formatBRL(contracts.annualCostTotal)} no exercício`}
            icon={Wallet01Icon}
            tone="accent"
            isLoading={isLoading}
          />
        </>
      ) : null}

      {commitments ? (
        <KpiCard
          label="Saldo dos empenhos"
          value={formatBRL(commitments.balanceTotal)}
          hint={`de ${formatBRL(released)} liberado`}
          icon={Coins01Icon}
          // Saldo abaixo de 10% do liberado é o sinal de que o empenho está
          // no fim — quem acompanha precisa reforçar antes de faturar.
          tone={released > 0 && commitments.balanceTotal / released < 0.1 ? "warning" : "success"}
          isLoading={isLoading}
        />
      ) : null}

      {data && data.monthly.length > 0 ? (
        <KpiCard
          label={`Faturado em ${monthLabel(month)}`}
          value={formatBRL(billedThisMonth ?? 0)}
          hint={`competência ${data.monthly[month - 1]?.competence ?? "—"}`}
          icon={MoneySend01Icon}
          tone="accent"
          delta={billingDelta(data.monthly, month)}
          isLoading={isLoading}
        />
      ) : null}
    </KpiGrid>
  )
}
