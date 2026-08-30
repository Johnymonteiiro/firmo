"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { commitmentColumns } from "@/components/commitments/commitment-columns"
import { NewCommitmentDialog } from "@/components/commitments/new-commitment-dialog"
import { useCommitments } from "@/lib/commitments"
import { useContracts } from "@/lib/contracts"
import { PERMISSIONS, useCan } from "@/lib/permissions"

export function CommitmentsDataTable() {
  const { data, isLoading, isError, error } = useCommitments(1, 100)
  const canCreate = useCan(PERMISSIONS.empenhosCriar)
  const { data: contracts } = useContracts(1, 100)

  const getContractNumber = React.useMemo(() => {
    const map = new Map(
      (contracts?.data ?? []).map((c) => [c.contractId, c.contractNumber])
    )
    return (contractId: string) => map.get(contractId) ?? "—"
  }, [contracts])

  const columns = React.useMemo(
    () => commitmentColumns({ getContractNumber }),
    [getContractNumber]
  )

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      getRowId={(c) => c.commitmentId}
      searchPlaceholder="Buscar empenhos..."
      actions={canCreate ? <NewCommitmentDialog /> : null}
      emptyMessage={
        isError
          ? error instanceof Error
            ? error.message
            : "Erro ao carregar os empenhos."
          : "Nenhum empenho cadastrado."
      }
    />
  )
}
