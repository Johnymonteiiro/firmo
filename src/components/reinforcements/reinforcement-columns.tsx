"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { formatDate } from "@/lib/format"
import {
  useArchiveReinforcement,
  type Reinforcement,
} from "@/lib/reinforcements"

export interface ReinforcementColumnsOptions {
  /** commitmentId -> SNE do empenho. */
  getCommitmentSne: (commitmentId: string) => string
}

export function reinforcementColumns({
  getCommitmentSne,
}: ReinforcementColumnsOptions): ColumnDef<Reinforcement>[] {
  return [
    {
      id: "commitment",
      accessorFn: (row) => getCommitmentSne(row.commitmentId),
      header: ({ column }) => (
        <DataGridColumnHeader title="Empenho (SNE)" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium tabular-nums">
          {getCommitmentSne(row.original.commitmentId)}
        </span>
      ),
      size: 150,
    },
    {
      accessorKey: "value",
      id: "value",
      header: ({ column }) => (
        <DataGridColumnHeader title="Valor" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block text-right font-mono tabular-nums">
          {row.original.value}
        </span>
      ),
      size: 150,
    },
    {
      accessorKey: "processNumber",
      id: "processNumber",
      header: ({ column }) => (
        <DataGridColumnHeader title="Processo" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {row.original.processNumber}
        </span>
      ),
      size: 190,
    },
    {
      accessorKey: "reinforcementDate",
      id: "reinforcementDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Data" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {formatDate(row.original.reinforcementDate)}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "reinforcedBy",
      id: "reinforcedBy",
      header: ({ column }) => (
        <DataGridColumnHeader title="Reforçado por" column={column} />
      ),
      size: 180,
    },
    actionsColumn(({ row }) => (
      <ReinforcementActionsCell
        reinforcement={row.original}
        commitmentSne={getCommitmentSne(row.original.commitmentId)}
      />
    )),
  ]
}

function ReinforcementActionsCell({
  reinforcement,
  commitmentSne,
}: {
  reinforcement: Reinforcement
  commitmentSne: string
}) {
  const archive = useArchiveReinforcement()
  return (
    <DataTableRowActions
      entityLabel="reforço"
      history={{
        entity: "reinforcement",
        recordId: reinforcement.reinforcementId,
        subtitle: `Empenho ${commitmentSne}`,
      }}
      onArchive={() => archive.mutateAsync(reinforcement.reinforcementId)}
    />
  )
}
