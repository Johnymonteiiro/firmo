"use client"

import * as React from "react"

import {
  ArchivedCard,
  ArchivedCardGrid,
} from "@/components/archived/archived-cards"
import { useArchivedBillings, useUnarchiveBilling } from "@/lib/billings"
import { useContracts } from "@/lib/contracts"

/** "2026-04" -> "04/2026" */
function formatPeriod(period: string): string {
  const [year, month] = period.split("-")
  return month && year ? `${month}/${year}` : period
}

export function ArchivedBillingsCards() {
  const { data, isLoading, isError, error } = useArchivedBillings(1, 100)
  const { data: contracts } = useContracts(1, 100)
  const unarchive = useUnarchiveBilling()

  const getContractNumber = React.useMemo(() => {
    const map = new Map(
      (contracts?.data ?? []).map((c) => [c.contractId, c.contractNumber])
    )
    return (contractId: string) => map.get(contractId) ?? "—"
  }, [contracts])

  const items = data?.data ?? []

  return (
    <ArchivedCardGrid
      items={items}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="Nenhum faturamento arquivado."
      searchPlaceholder="Buscar faturamentos..."
      getSearchText={(b) =>
        `${b.period} ${b.contractedCompany} ${getContractNumber(b.contractId)}`
      }
      renderCard={(b) => (
        <ArchivedCard
          key={b.billingId}
          topLabel={`Competência ${formatPeriod(b.period)}`}
          title={b.contractedCompany}
          subtitle={`Contrato ${getContractNumber(b.contractId)}`}
          fields={[
            { label: "Valor faturado", value: b.billedAmount1 ?? "—", mono: true },
            { label: "Economizado", value: b.savedAmount ?? "—", mono: true },
          ]}
          archivedAt={b.deletedAt ?? b.updatedAt}
          entityLabel="faturamento"
          onUnarchive={() => unarchive.mutateAsync(b.billingId)}
          history={{
            entity: "billing",
            recordId: b.billingId,
            subtitle: `Competência ${formatPeriod(b.period)} · ${b.contractedCompany}`,
          }}
        />
      )}
    />
  )
}
