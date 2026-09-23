"use client"

import { KpiCard, KpiGrid } from "@/components/kpi"
import { parseBRL } from "@/lib/format"
import type { BudgetTotals } from "@/lib/budget"
import {
  MoneyBag02Icon,
  Coins01Icon,
  PiggyBankIcon,
  WalletAdd01Icon,
} from "@hugeicons/core-free-icons"

/**
 * Cartões do topo (RF-GO04). Os totais vêm somados pelo backend sobre o
 * recorte inteiro — somar as linhas da página daria outro número.
 */
export function BudgetKpis({
  totals,
  contracts,
  year,
  isLoading,
}: {
  totals?: BudgetTotals
  contracts: number
  year: number
  isLoading?: boolean
}) {
  const released = totals ? parseBRL(totals.releasedBudget) : 0
  const annual = totals ? parseBRL(totals.annualCost) : 0

  return (
    <KpiGrid>
      <KpiCard
        label="Custo anual dos contratos"
        value={totals?.annualCost ?? "—"}
        hint={`${contracts} contrato${contracts === 1 ? "" : "s"} vigente${contracts === 1 ? "" : "s"} em ${year}`}
        icon={MoneyBag02Icon}
        tone="accent"
        isLoading={isLoading}
      />
      <KpiCard
        label="Orçamento liberado"
        value={totals?.releasedBudget ?? "—"}
        icon={WalletAdd01Icon}
        // Liberado abaixo do custo do ano é o alerta que a planilha pinta na
        // coluna H — aqui ele sobe para o cartão.
        tone={totals && released < annual ? "warning" : "success"}
        isLoading={isLoading}
      />
      <KpiCard
        label="Saldo dos empenhos"
        value={totals?.commitmentsBalance ?? "—"}
        hint="Disponível para faturar"
        icon={Coins01Icon}
        tone="success"
        isLoading={isLoading}
      />
      <KpiCard
        label="Total economizado"
        value={totals?.totalSaved ?? "—"}
        icon={PiggyBankIcon}
        tone={
          totals && parseBRL(totals.totalSaved) > 0 ? "success" : "default"
        }
        isLoading={isLoading}
      />
    </KpiGrid>
  )
}
