"use client"

import {
  ArchivedCard,
  ArchivedCardGrid,
} from "@/components/archived/archived-cards"
import {
  ContractStatusBadge,
  getDisplayStatus,
} from "@/components/contracts/contract-status-badge"
import { useArchivedContracts, useUnarchiveContract } from "@/lib/contracts"
import { formatDate } from "@/lib/format"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"

export function ArchivedContractsCards() {
  const { data, isLoading, isError, error } = useArchivedContracts(1, 100)
  const unarchive = useUnarchiveContract()
  const { can } = usePermissions()
  const items = data?.data ?? []

  return (
    <ArchivedCardGrid
      items={items}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="Nenhum contrato arquivado."
      searchPlaceholder="Buscar contratos..."
      getSearchText={(c) => `${c.contractNumber} ${c.company} ${c.subject}`}
      renderCard={(c) => (
        <ArchivedCard
          key={c.contractId}
          topLabel={`Nº ${c.contractNumber}`}
          statusBadge={<ContractStatusBadge status={getDisplayStatus(c)} />}
          title={c.subject}
          subtitle={c.company}
          fields={[
            {
              label: "Vigência",
              value: `${formatDate(c.startDate)} — ${formatDate(c.expiresAt)}`,
              mono: true,
            },
            {
              label: "Valor total",
              value: c.currentYearAnnualValue,
              mono: true,
            },
          ]}
          archivedAt={c.deletedAt ?? c.updatedAt}
          entityLabel="contrato"
          onUnarchive={
            can(PERMISSIONS.contratosArquivar)
              ? () => unarchive.mutateAsync(c.contractId)
              : undefined
          }
          history={
            can(PERMISSIONS.auditoriaVisualizar)
              ? {
                  entity: "contract",
                  recordId: c.contractId,
                  subtitle: `Nº ${c.contractNumber} · ${c.company}`,
                }
              : undefined
          }
        />
      )}
    />
  )
}
