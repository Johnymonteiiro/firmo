"use client"

import * as React from "react"

import { KpiCard, KpiGrid } from "@/components/kpi"
import { parseBRL } from "@/lib/format"
import { useCreditors } from "@/lib/non-continuous"
import {
  Building04Icon,
  Coins01Icon,
  MoneyReceive01Icon,
  MoneySend01Icon,
} from "@hugeicons/core-free-icons"

/**
 * KPIs da tela de Empresas e Saldos. Empenhado, pago e saldo vêm somados pelo
 * backend (`totals`) — somar as 100 linhas carregadas daria outro número assim
 * que a base passar de uma página.
 */
export function CreditorsKpis() {
  const { data, isLoading } = useCreditors(1, 100)
  const totals = data?.totals

  const creditors = React.useMemo(() => data?.data ?? [], [data])
  const anos = React.useMemo(
    () => new Set(creditors.map((c) => c.year)),
    [creditors]
  )
  const comSaldo = React.useMemo(
    () => creditors.filter((c) => parseBRL(c.currentBalance) > 0).length,
    [creditors]
  )

  return (
    <KpiGrid>
      <KpiCard
        label="Credores cadastrados"
        value={data?.total ?? 0}
        hint={`${comSaldo} com saldo · ${anos.size} ano${anos.size === 1 ? "" : "s"}`}
        icon={Building04Icon}
        tone="info"
        isLoading={isLoading}
      />
      <KpiCard
        label="Total empenhado"
        value={totals?.committed ?? "—"}
        hint="Soma dos movimentos de empenho"
        icon={MoneyReceive01Icon}
        tone="accent"
        isLoading={isLoading}
      />
      <KpiCard
        label="Total pago"
        value={totals?.paid ?? "—"}
        hint="Soma dos movimentos de pagamento"
        icon={MoneySend01Icon}
        tone="accent"
        isLoading={isLoading}
      />
      <KpiCard
        label="Saldo a pagar"
        value={totals?.balance ?? "—"}
        icon={Coins01Icon}
        tone={
          totals && parseBRL(totals.balance) > 0 ? "warning" : "success"
        }
        isLoading={isLoading}
      />
    </KpiGrid>
  )
}
