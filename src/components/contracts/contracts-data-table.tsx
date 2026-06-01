"use client"

import { DataTable } from "@/components/data-table/data-table"
import { contractColumns } from "@/components/contracts/contract-columns"
import { NewContractDialog } from "@/components/contracts/new-contract-dialog"
import { useContracts } from "@/lib/contracts"

export function ContractsDataTable() {
  // UI-first: carrega um lote grande e deixa busca/ordenação/paginação client-side.
  const { data, isLoading, isError, error } = useContracts(1, 100)

  return (
    <DataTable
      columns={contractColumns}
      data={data?.data ?? []}
      isLoading={isLoading}
      getRowId={(c) => c.contractId}
      searchPlaceholder="Buscar contratos..."
      filters={[{ columnId: "status", title: "Status" }]}
      actions={<NewContractDialog />}
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
