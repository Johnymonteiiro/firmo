"use client"

import { DataTable } from "@/components/data-table/data-table"
import { reinforcementColumns } from "@/components/reinforcements/reinforcement-columns"
import { NewReinforcementDialog } from "@/components/reinforcements/new-reinforcement-dialog"
import { useReinforcements } from "@/lib/reinforcements"

export function ReinforcementsDataTable() {
  const { data, isLoading, isError, error } = useReinforcements(1, 100)

  return (
    <DataTable
      columns={reinforcementColumns}
      data={data?.data ?? []}
      isLoading={isLoading}
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
