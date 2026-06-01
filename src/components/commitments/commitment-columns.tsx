"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { formatDate } from "@/lib/format"
import type { Commitment } from "@/lib/commitments"

export const commitmentColumns: ColumnDef<Commitment>[] = [
  {
    accessorKey: "sne",
    id: "sne",
    header: ({ column }) => <DataGridColumnHeader title="SNE" column={column} />,
    cell: ({ row }) => (
      <span className="font-mono font-medium tabular-nums">
        {row.original.sne}
      </span>
    ),
    size: 120,
  },
  {
    accessorKey: "contractedCompany",
    id: "contractedCompany",
    header: ({ column }) => (
      <DataGridColumnHeader title="Empresa" column={column} />
    ),
    size: 200,
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
    accessorKey: "siafi",
    id: "siafi",
    header: ({ column }) => (
      <DataGridColumnHeader title="SIAFI" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{row.original.siafi}</span>
    ),
    size: 140,
  },
  {
    accessorKey: "sneDate",
    id: "sneDate",
    header: ({ column }) => (
      <DataGridColumnHeader title="Data SNE" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.original.sneDate)}
      </span>
    ),
    size: 120,
  },
  {
    accessorKey: "initialValue",
    id: "initialValue",
    header: ({ column }) => (
      <DataGridColumnHeader title="Valor Inicial" column={column} />
    ),
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">
        {row.original.initialValue}
      </span>
    ),
    size: 150,
  },
  {
    accessorKey: "currentBalance",
    id: "currentBalance",
    header: ({ column }) => (
      <DataGridColumnHeader title="Saldo Atual" column={column} />
    ),
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">
        {row.original.currentBalance}
      </span>
    ),
    size: 150,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <DataTableRowActions
        onEdit={() =>
          toast.info("Editar empenho", { description: row.original.sne })
        }
        onArchive={() =>
          toast.warning("Arquivar empenho", { description: row.original.sne })
        }
      />
    ),
    size: 60,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
]
