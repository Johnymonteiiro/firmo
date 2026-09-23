"use client"

import * as React from "react"

import { KpiCard, KpiGrid } from "@/components/kpi"
import { formatBRL, parseBRL } from "@/lib/format"
import { useMovements } from "@/lib/non-continuous"
import {
  Coins01Icon,
  MoneyReceive01Icon,
  MoneySend01Icon,
  Note01Icon,
} from "@hugeicons/core-free-icons"

/** KPIs do razão — mesma query da tabela (react-query deduplica). */
export function MovementsKpis() {
  const { data, isLoading } = useMovements(1, 100)
  const movements = React.useMemo(() => data?.data ?? [], [data])

  const stats = React.useMemo(() => {
    let committed = 0
    let paid = 0
    let pendingPayments = 0
    for (const movement of movements) {
      const value = parseBRL(movement.value)
      if (movement.qualification === "EMPENHO") committed += value
      else {
        paid += value
        if (!movement.paymentDate) pendingPayments += 1
      }
    }
    return { committed, paid, pendingPayments }
  }, [movements])

  return (
    <KpiGrid>
      <KpiCard
        label="Lançamentos"
        value={data?.total ?? 0}
        hint="Empenhos e pagamentos ativos"
        icon={Note01Icon}
        tone="info"
        isLoading={isLoading}
      />
      <KpiCard
        label="Empenhado"
        value={formatBRL(stats.committed)}
        hint="Soma dos empenhos listados"
        icon={MoneyReceive01Icon}
        tone="accent"
        isLoading={isLoading}
      />
      <KpiCard
        label="Pago"
        value={formatBRL(stats.paid)}
        hint="Soma dos pagamentos listados"
        icon={MoneySend01Icon}
        tone="accent"
        isLoading={isLoading}
      />
      <KpiCard
        label="Saldo a pagar"
        value={formatBRL(stats.committed - stats.paid)}
        icon={Coins01Icon}
        tone={stats.committed - stats.paid > 0 ? "warning" : "success"}
        isLoading={isLoading}
      />
    </KpiGrid>
  )
}
