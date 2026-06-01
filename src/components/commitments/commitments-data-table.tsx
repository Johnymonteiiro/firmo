"use client"

import { DataTable } from "@/components/data-table/data-table"
import { commitmentColumns } from "@/components/commitments/commitment-columns"
import { NewCommitmentDialog } from "@/components/commitments/new-commitment-dialog"
import { useCommitments } from "@/lib/commitments"

export function CommitmentsDataTable() {
  const { data, isLoading, isError, error } = useCommitments(1, 100)

  return (
    <DataTable
      columns={commitmentColumns}
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
