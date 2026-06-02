"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { billingColumns } from "@/components/billings/billing-columns"
import { NewBillingDialog } from "@/components/billings/new-billing-dialog"
import { useBillings } from "@/lib/billings"
import { useContracts } from "@/lib/contracts"

export function BillingsDataTable() {
  const { data, isLoading, isError, error } = useBillings(1, 100)
  const { data: contracts } = useContracts(1, 100)

  const getContractNumber = React.useMemo(() => {
    const map = new Map(
      (contracts?.data ?? []).map((c) => [c.contractId, c.contractNumber])
    )
    return (contractId: string) => map.get(contractId) ?? "—"
  }, [contracts])

  const columns = React.useMemo(
    () => billingColumns({ getContractNumber }),
    [getContractNumber]
  )

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      getRowId={(b) => b.billingId}
      searchPlaceholder="Buscar faturamentos..."
      actions={<NewBillingDialog />}
      emptyMessage={
        isError
          ? error instanceof Error
            ? error.message
            : "Erro ao carregar os faturamentos."
          : "Nenhum faturamento cadastrado."
      }
    />
  )
}
