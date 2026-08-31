"use client"

import * as React from "react"

import {
  ArchivedCard,
  ArchivedCardGrid,
} from "@/components/archived/archived-cards"
import { QUALIFICATION_LABEL } from "@/components/non-continuous/movement-qualification-badge"
import { formatDate } from "@/lib/format"
import {
  useArchivedMovements,
  useCreditors,
  useUnarchiveMovement,
} from "@/lib/non-continuous"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"

export function ArchivedMovementsCards() {
  const { data, isLoading, isError, error } = useArchivedMovements(1, 100)
  const { data: creditors } = useCreditors(1, 100)
  const unarchive = useUnarchiveMovement()
  const { can } = usePermissions()

  const getCreditorName = React.useMemo(() => {
    const map = new Map(
      (creditors?.data ?? []).map((c) => [c.creditorId, c.creditor])
    )
    return (id: string) => map.get(id) ?? "—"
  }, [creditors])

  return (
    <ArchivedCardGrid
      items={data?.data ?? []}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="Nenhum movimento arquivado."
      searchPlaceholder="Buscar movimentos..."
      getSearchText={(m) =>
        `${m.sequentialNumber} ${m.processNumber} ${getCreditorName(m.creditorId)}`
      }
      renderCard={(m) => (
        <ArchivedCard
          key={m.movementId}
          topLabel={`${QUALIFICATION_LABEL[m.qualification]} ${m.sequentialNumber}`}
          title={getCreditorName(m.creditorId)}
          subtitle={m.processNumber}
          fields={[
            { label: "Valor", value: m.value, mono: true },
            {
              label: "Emissão",
              value: formatDate(m.issueDate),
              mono: true,
            },
          ]}
          archivedAt={m.deletedAt ?? m.updatedAt}
          entityLabel="movimento"
          onUnarchive={
            can(PERMISSIONS.naoContinuadosArquivar)
              ? () => unarchive.mutateAsync(m.movementId)
              : undefined
          }
          history={
            can(PERMISSIONS.auditoriaVisualizar)
              ? {
                  entity: "movement",
                  recordId: m.movementId,
                  subtitle: `${QUALIFICATION_LABEL[m.qualification]} ${m.sequentialNumber} · ${m.value}`,
                }
              : undefined
          }
        />
      )}
    />
  )
}
