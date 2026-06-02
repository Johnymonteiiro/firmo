"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { formatDate } from "@/lib/format"
import type { Reinforcement } from "@/lib/reinforcements"

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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DataTableRowActions
          onEdit={() =>
            toast.info("Editar reforço", { description: row.original.value })
          }
          onArchive={() =>
            toast.warning("Arquivar reforço", {
              description: row.original.value,
            })
          }
        />
      ),
      size: 60,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
    },
  ]
}
