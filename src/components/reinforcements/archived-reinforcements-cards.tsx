"use client"

import * as React from "react"

import {
  ArchivedCard,
  ArchivedCardGrid,
} from "@/components/archived/archived-cards"
import { useCommitments } from "@/lib/commitments"
import {
  useArchivedReinforcements,
  useUnarchiveReinforcement,
} from "@/lib/reinforcements"
import { formatDate } from "@/lib/format"

export function ArchivedReinforcementsCards() {
  const { data, isLoading, isError, error } = useArchivedReinforcements(1, 100)
  const { data: commitments } = useCommitments(1, 100)
  const unarchive = useUnarchiveReinforcement()

  const getCommitmentSne = React.useMemo(() => {
    const map = new Map(
      (commitments?.data ?? []).map((c) => [c.commitmentId, c.sne])
    )
    return (commitmentId: string) => map.get(commitmentId) ?? "—"
  }, [commitments])

  const items = data?.data ?? []

  return (
    <ArchivedCardGrid
      items={items}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="Nenhum reforço arquivado."
      searchPlaceholder="Buscar reforços..."
      getSearchText={(r) =>
        `${getCommitmentSne(r.commitmentId)} ${r.value} ${r.processNumber}`
      }
      renderCard={(r) => (
        <ArchivedCard
          key={r.reinforcementId}
          topLabel="Reforço"
          title={`Empenho ${getCommitmentSne(r.commitmentId)}`}
          fields={[
            { label: "Valor", value: r.value, mono: true },
            {
              label: "Data",
              value: formatDate(r.reinforcementDate),
              mono: true,
            },
          ]}
          archivedAt={r.deletedAt ?? r.updatedAt}
          entityLabel="reforço"
          onUnarchive={() => unarchive.mutateAsync(r.reinforcementId)}
          history={{
            entity: "reinforcement",
            recordId: r.reinforcementId,
            subtitle: `Empenho ${getCommitmentSne(r.commitmentId)}`,
          }}
        />
      )}
    />
  )
}
