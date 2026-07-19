"use client"

import * as React from "react"

import { KpiCard, KpiGrid } from "@/components/kpi"
import { formatBRL, parseBRL } from "@/lib/format"
import { useCommitments } from "@/lib/commitments"
import { useReinforcements } from "@/lib/reinforcements"
import {
  Coins01Icon,
  MoneyReceive01Icon,
  PiggyBankIcon,
  SavingsIcon,
} from "@hugeicons/core-free-icons"

/** parseBRL descarta o sinal — savedAmount pode ser negativo. */
const parseSignedBRL = (value: string) =>
  (value.includes("-") ? -1 : 1) * parseBRL(value)

/** KPIs da listagem de empenhos — mesmas queries da tabela (dedupe). */
export function CommitmentsKpis() {
  const { data, isLoading } = useCommitments(1, 100)
  // Só o total interessa aqui (contagem de reforços ativos).
  const { data: reinforcements } = useReinforcements(1, 1)
  const commitments = React.useMemo(() => data?.data ?? [], [data])

  const stats = React.useMemo(() => {
    const byStatus = { VIGENTE: 0, SALDO: 0, ENCERRADO: 0 }
    let balance = 0
    let reinforced = 0
    let saved = 0
    for (const c of commitments) {
      byStatus[c.status] += 1
      balance += parseBRL(c.currentBalance)
      reinforced += parseBRL(c.reinforcementValue)
      saved += parseSignedBRL(c.savedAmount)
    }
    return { byStatus, balance, reinforced, saved }
  }, [commitments])

  const { byStatus } = stats

  return (
    <KpiGrid>
      <KpiCard
        label="Total de empenhos"
        value={data?.total ?? 0}
        hint={`${byStatus.VIGENTE} vigentes · ${byStatus.SALDO} c/ saldo antigo · ${byStatus.ENCERRADO} encerrados`}
        icon={MoneyReceive01Icon}
        tone={byStatus.SALDO > 0 ? "warning" : "default"}
        isLoading={isLoading}
      />
      <KpiCard
        label="Saldo atual total"
        value={formatBRL(stats.balance)}
        hint="Soma dos saldos dos empenhos ativos"
        icon={Coins01Icon}
        isLoading={isLoading}
      />
      <KpiCard
        label="Reforços ativos"
        value={formatBRL(stats.reinforced)}
        hint={`${reinforcements?.total ?? 0} reforço${(reinforcements?.total ?? 0) === 1 ? "" : "s"} registrados`}
        icon={SavingsIcon}
        isLoading={isLoading}
      />
      <KpiCard
        label="Valor economizado"
        value={formatBRL(stats.saved)}
        hint="(inicial + reajuste) − faturado"
        icon={PiggyBankIcon}
        tone={stats.saved < 0 ? "destructive" : "success"}
        isLoading={isLoading}
      />
    </KpiGrid>
  )
}
