"use client"

import * as React from "react"

import { KpiCard, KpiGrid } from "@/components/kpi"
import { getDisplayStatus } from "@/components/contracts/contract-status-badge"
import { formatBRL, parseBRL } from "@/lib/format"
import { useContracts } from "@/lib/contracts"
import {
  Calendar03Icon,
  CheckListIcon,
  MoneyBag02Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

/** KPIs da listagem de contratos — mesma query da tabela (React Query dedupe). */
export function ContractsKpis() {
  const { data, isLoading } = useContracts(1, 100)
  const contracts = React.useMemo(() => data?.data ?? [], [data])

  const stats = React.useMemo(() => {
    const byStatus = { VIGENTE: 0, A_VENCER: 0, ENCERRADO: 0, EXPIRADO: 0 }
    let monthly = 0
    let annual = 0
    for (const c of contracts) {
      byStatus[getDisplayStatus(c)] += 1
      monthly += parseBRL(c.effectiveMonthlyValue)
      annual += parseBRL(c.currentYearAnnualValue)
    }
    return { byStatus, monthly, annual }
  }, [contracts])

  const { byStatus } = stats

  return (
    <KpiGrid>
      <KpiCard
        label="Total de contratos"
        value={data?.total ?? 0}
        hint={`${byStatus.VIGENTE + byStatus.A_VENCER} vigentes · ${byStatus.ENCERRADO} encerrados · ${byStatus.EXPIRADO} expirados`}
        icon={CheckListIcon}
        isLoading={isLoading}
      />
      <KpiCard
        label="A vencer (até 60 dias)"
        value={byStatus.A_VENCER}
        hint="Contratos vigentes perto do vencimento"
        icon={Calendar03Icon}
        tone={byStatus.A_VENCER > 0 ? "warning" : "default"}
        isLoading={isLoading}
      />
      <KpiCard
        label="Valor mensal total"
        value={formatBRL(stats.monthly)}
        hint="Soma dos valores mensais vigentes"
        icon={Wallet01Icon}
        isLoading={isLoading}
      />
      <KpiCard
        label="Custo anual (exercício)"
        value={formatBRL(stats.annual)}
        hint={`Estimativa para ${new Date().getFullYear()}`}
        icon={MoneyBag02Icon}
        isLoading={isLoading}
      />
    </KpiGrid>
  )
}
