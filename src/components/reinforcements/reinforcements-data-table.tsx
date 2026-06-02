"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { reinforcementColumns } from "@/components/reinforcements/reinforcement-columns"
import { NewReinforcementDialog } from "@/components/reinforcements/new-reinforcement-dialog"
import { useCommitments } from "@/lib/commitments"
import { useReinforcements } from "@/lib/reinforcements"

export function ReinforcementsDataTable() {
  const { data, isLoading, isError, error } = useReinforcements(1, 100)
  const { data: commitments } = useCommitments(1, 100)

  const getCommitmentSne = React.useMemo(() => {
    const map = new Map(
      (commitments?.data ?? []).map((c) => [c.commitmentId, c.sne])
    )
    return (commitmentId: string) => map.get(commitmentId) ?? "—"
  }, [commitments])

  const columns = React.useMemo(
    () => reinforcementColumns({ getCommitmentSne }),
    [getCommitmentSne]
  )

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      resizable={false}
      getRowId={(r) => r.reinforcementId}
      searchPlaceholder="Buscar reforços..."
      actions={<NewReinforcementDialog />}
      emptyMessage={
        isError
          ? error instanceof Error
            ? error.message
            : "Erro ao carregar os reforços."
          : "Nenhum reforço cadastrado."
      }
    />
  )
}
