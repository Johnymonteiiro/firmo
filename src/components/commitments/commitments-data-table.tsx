"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { commitmentColumns } from "@/components/commitments/commitment-columns"
import { NewCommitmentDialog } from "@/components/commitments/new-commitment-dialog"
import { useCommitments } from "@/lib/commitments"
import { useContracts } from "@/lib/contracts"
import { useReinforcements } from "@/lib/reinforcements"
import { formatBRL, parseBRL } from "@/lib/format"

export function CommitmentsDataTable() {
  const { data, isLoading, isError, error } = useCommitments(1, 100)
  const { data: contracts } = useContracts(1, 100)
  const { data: reinforcements } = useReinforcements(1, 100)

  const getContractNumber = React.useMemo(() => {
    const map = new Map(
      (contracts?.data ?? []).map((c) => [c.contractId, c.contractNumber])
    )
    return (contractId: string) => map.get(contractId) ?? "—"
  }, [contracts])

  const getReinforcementsTotal = React.useMemo(() => {
    const totals = new Map<string, number>()
    for (const r of reinforcements?.data ?? []) {
      totals.set(
        r.commitmentId,
        (totals.get(r.commitmentId) ?? 0) + parseBRL(r.value)
      )
    }
    return (commitmentId: string) => formatBRL(totals.get(commitmentId) ?? 0)
  }, [reinforcements])

  const columns = React.useMemo(
    () => commitmentColumns({ getContractNumber, getReinforcementsTotal }),
    [getContractNumber, getReinforcementsTotal]
  )

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      getRowId={(c) => c.commitmentId}
      searchPlaceholder="Buscar empenhos..."
      actions={<NewCommitmentDialog />}
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
