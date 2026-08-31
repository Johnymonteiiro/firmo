"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { MovementFormDialog } from "@/components/non-continuous/movement-form-dialog"
import {
  MovementQualificationBadge,
  QUALIFICATION_LABEL,
} from "@/components/non-continuous/movement-qualification-badge"
import { formatDate, parseBRL } from "@/lib/format"
import { useArchiveMovement, type Movement } from "@/lib/non-continuous"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"

export interface MovementColumnsOptions {
  /** creditorId -> nome do credor. */
  getCreditorName: (creditorId: string) => string
}

export function movementColumns({
  getCreditorName,
}: MovementColumnsOptions): ColumnDef<Movement>[] {
  return [
    {
      id: "creditor",
      accessorFn: (row) => getCreditorName(row.creditorId),
      header: ({ column }) => (
        <DataGridColumnHeader title="Credor" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {getCreditorName(row.original.creditorId)}
        </span>
      ),
      size: 240,
    },
    {
      accessorKey: "issueDate",
      id: "issueDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Emissão" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {formatDate(row.original.issueDate)}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "year",
      id: "year",
      header: ({ column }) => (
        <DataGridColumnHeader title="Ano" column={column} />
      ),
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">{row.original.year}</span>
      ),
      size: 80,
    },
    {
      accessorKey: "sequentialNumber",
      id: "sequentialNumber",
      header: ({ column }) => (
        <DataGridColumnHeader title="Sequencial" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {row.original.sequentialNumber}
        </span>
      ),
      size: 130,
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
      // Filtra pelo rótulo em português — é o que a toolbar mostra na lista.
      id: "qualification",
      accessorFn: (row) => QUALIFICATION_LABEL[row.qualification],
      header: ({ column }) => (
        <DataGridColumnHeader title="Qualificação" column={column} />
      ),
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      cell: ({ row }) => (
        <MovementQualificationBadge
          qualification={row.original.qualification}
        />
      ),
      size: 130,
    },
    {
      accessorKey: "value",
      id: "value",
      header: ({ column }) => (
        <DataGridColumnHeader title="Valor (R$)" column={column} />
      ),
      sortingFn: (a, b) =>
        parseBRL(a.original.value) - parseBRL(b.original.value),
      cell: ({ row }) => (
        <span className="block text-right font-mono tabular-nums">
          {row.original.value}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "paymentDate",
      id: "paymentDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Pagamento" column={column} />
      ),
      cell: ({ row }) =>
        row.original.paymentDate ? (
          <span className="font-mono tabular-nums">
            {formatDate(row.original.paymentDate)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      size: 120,
    },
    {
      id: "creditorFilter",
      accessorFn: (row) => getCreditorName(row.creditorId),
      filterFn: (row, id, value: string[]) =>
        !value?.length || value.includes(row.getValue(id) as string),
      meta: { filterOnly: true },
    },
    {
      // Pagamento lançado ou ainda pendente — a pergunta do dia a dia da tela.
      id: "paymentState",
      accessorFn: (row) => (row.paymentDate ? "Pago" : "Sem pagamento"),
      filterFn: (row, id, value: string[]) =>
        !value?.length || value.includes(row.getValue(id) as string),
      meta: { filterOnly: true },
    },
    actionsColumn(({ row }) => <MovementActionsCell movement={row.original} />),
  ]
}

function MovementActionsCell({ movement }: { movement: Movement }) {
  const archive = useArchiveMovement()
  const [editOpen, setEditOpen] = React.useState(false)
  const { can } = usePermissions()

  return (
    <>
      <DataTableRowActions
        entityLabel="movimento"
        onEdit={
          can(PERMISSIONS.naoContinuadosEditar)
            ? () => setEditOpen(true)
            : undefined
        }
        history={
          can(PERMISSIONS.auditoriaVisualizar)
            ? {
                entity: "movement",
                recordId: movement.movementId,
                subtitle: `${QUALIFICATION_LABEL[movement.qualification]} ${movement.sequentialNumber} · ${movement.value}`,
              }
            : undefined
        }
        onArchive={
          can(PERMISSIONS.naoContinuadosArquivar)
            ? () => archive.mutateAsync(movement.movementId)
            : undefined
        }
      />
      {editOpen ? (
        <MovementFormDialog
          movement={movement}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </>
  )
}
