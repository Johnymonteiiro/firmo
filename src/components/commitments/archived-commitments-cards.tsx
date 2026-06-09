"use client"

import * as React from "react"

import {
  ArchivedCard,
  ArchivedCardGrid,
} from "@/components/archived/archived-cards"
import {
  useArchivedCommitments,
  useUnarchiveCommitment,
} from "@/lib/commitments"
import { useContracts } from "@/lib/contracts"

export function ArchivedCommitmentsCards() {
  const { data, isLoading, isError, error } = useArchivedCommitments(1, 100)
  const { data: contracts } = useContracts(1, 100)
  const unarchive = useUnarchiveCommitment()

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
      emptyMessage="Nenhum empenho arquivado."
      searchPlaceholder="Buscar empenhos..."
      getSearchText={(c) =>
        `${c.sne} ${c.contractedCompany} ${getContractNumber(c.contractId)}`
      }
      renderCard={(c) => (
        <ArchivedCard
          key={c.commitmentId}
          topLabel={`SNE ${c.sne}`}
          title={c.contractedCompany}
          subtitle={`Contrato ${getContractNumber(c.contractId)}`}
          fields={[
            { label: "Valor inicial", value: c.initialValue, mono: true },
            { label: "Saldo atual", value: c.currentBalance, mono: true },
          ]}
          archivedAt={c.deletedAt ?? c.updatedAt}
          entityLabel="empenho"
          onUnarchive={() => unarchive.mutateAsync(c.commitmentId)}
          history={{
            entity: "commitment",
            recordId: c.commitmentId,
            subtitle: `SNE ${c.sne} · ${c.contractedCompany}`,
          }}
        />
      )}
    />
  )
}
