"use client"

import { DataTable } from "@/components/data-table/data-table"
import {
  contractColumns,
  DUE_BUCKETS,
} from "@/components/contracts/contract-columns"
import { NewContractDialog } from "@/components/contracts/new-contract-dialog"
import { useContracts } from "@/lib/contracts"
import { PERMISSIONS, useCan } from "@/lib/permissions"

export function ContractsDataTable() {
  // UI-first: carrega um lote grande e deixa busca/ordenação/paginação client-side.
  const { data, isLoading, isError, error } = useContracts(1, 100)
  const canCreate = useCan(PERMISSIONS.contratosCriar)

  return (
    <DataTable
      columns={contractColumns}
      data={data?.data ?? []}
      isLoading={isLoading}
      getRowId={(c) => c.contractId}
      searchPlaceholder="Buscar contratos..."
      filters={[
        { columnId: "status", title: "Status" },
        { columnId: "dueBucket", title: "Vencimento", order: [...DUE_BUCKETS] },
        { columnId: "companyFilter", title: "Empresa" },
        { columnId: "managerFilter", title: "Gestor" },
        { columnId: "hasAdjustment", title: "Reajuste" },
      ]}
      actions={canCreate ? <NewContractDialog /> : null}
      emptyMessage={
        isError
          ? error instanceof Error
            ? error.message
            : "Erro ao carregar os contratos."
          : "Nenhum contrato cadastrado."
      }
    />
  )
}
