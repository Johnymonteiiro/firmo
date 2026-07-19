"use client"

import * as React from "react"

import { KpiCard, KpiGrid } from "@/components/kpi"
import { formatBRL, parseBRL } from "@/lib/format"
import { useBillings } from "@/lib/billings"
import {
  Calendar03Icon,
  File01Icon,
  Invoice01Icon,
  MoneySend01Icon,
} from "@hugeicons/core-free-icons"

/**
 * KPIs da listagem de faturamentos — mesma query da tabela (dedupe).
 * Obs.: `savedAmount` NÃO é somado aqui — é um valor por empenho repetido em
 * cada fatura da mesma SNE (somar duplicaria); o agregado vive nos KPIs de
 * empenhos.
 */
export function BillingsKpis() {
  const { data, isLoading } = useBillings(1, 100)
  const billings = React.useMemo(() => data?.data ?? [], [data])

  const currentYear = String(new Date().getFullYear())

  const stats = React.useMemo(() => {
    const contracts = new Set<string>()
    let billedTotal = 0
    let billedThisYear = 0
    let periodsThisYear = 0
    let missingPaymentRequest = 0
    for (const b of billings) {
      contracts.add(b.contractId)
      const amount =
        (b.billedAmount1 ? parseBRL(b.billedAmount1) : 0) +
        (b.billedAmount2 ? parseBRL(b.billedAmount2) : 0)
      billedTotal += amount
      if (b.period.startsWith(currentYear)) {
        billedThisYear += amount
        periodsThisYear += 1
      }
      if (!b.paymentRequestNumber) missingPaymentRequest += 1
    }
    return {
      contracts: contracts.size,
      billedTotal,
      billedThisYear,
      periodsThisYear,
      missingPaymentRequest,
    }
  }, [billings, currentYear])

  return (
    <KpiGrid>
      <KpiCard
        label="Total de faturamentos"
        value={data?.total ?? 0}
        hint={`em ${stats.contracts} contrato${stats.contracts === 1 ? "" : "s"}`}
        icon={Invoice01Icon}
        isLoading={isLoading}
      />
      <KpiCard
        label="Total faturado"
        value={formatBRL(stats.billedTotal)}
        hint="Soma dos valores faturados ativos"
        icon={MoneySend01Icon}
        isLoading={isLoading}
      />
      <KpiCard
        label={`Faturado em ${currentYear}`}
        value={formatBRL(stats.billedThisYear)}
        hint={`${stats.periodsThisYear} competência${stats.periodsThisYear === 1 ? "" : "s"} no exercício`}
        icon={Calendar03Icon}
        isLoading={isLoading}
      />
      <KpiCard
        label="Sem solicitação de pagamento"
        value={stats.missingPaymentRequest}
        hint="Faturas aguardando nº de solicitação"
        icon={File01Icon}
        tone={stats.missingPaymentRequest > 0 ? "warning" : "success"}
        isLoading={isLoading}
      />
    </KpiGrid>
  )
}
