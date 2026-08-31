"use client"

import {
  ArchivedCard,
  ArchivedCardGrid,
} from "@/components/archived/archived-cards"
import {
  useArchivedCreditors,
  useUnarchiveCreditor,
} from "@/lib/non-continuous"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"

export function ArchivedCreditorsCards() {
  const { data, isLoading, isError, error } = useArchivedCreditors(1, 100)
  const unarchive = useUnarchiveCreditor()
  const { can } = usePermissions()

  return (
    <ArchivedCardGrid
      items={data?.data ?? []}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="Nenhum credor arquivado."
      searchPlaceholder="Buscar credores..."
      getSearchText={(c) => `${c.creditor} ${c.object} ${c.year}`}
      renderCard={(c) => (
        <ArchivedCard
          key={c.creditorId}
          topLabel={String(c.year)}
          title={c.creditor}
          subtitle={c.object}
          fields={[{ label: "Saldo", value: c.currentBalance, mono: true }]}
          archivedAt={c.deletedAt ?? c.updatedAt}
          entityLabel="credor"
          onUnarchive={
            can(PERMISSIONS.naoContinuadosArquivar)
              ? () => unarchive.mutateAsync(c.creditorId)
              : undefined
          }
          history={
            can(PERMISSIONS.auditoriaVisualizar)
              ? {
                  entity: "creditor",
                  recordId: c.creditorId,
                  subtitle: `${c.creditor} · ${c.object} · ${c.year}`,
                }
              : undefined
          }
        />
      )}
    />
  )
}
