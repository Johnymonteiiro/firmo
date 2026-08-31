"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { CreditorFormDialog } from "@/components/non-continuous/creditor-form-dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { parseBRL } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  useArchiveCreditor,
  type Creditor,
} from "@/lib/non-continuous"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"
import { HugeiconsIcon } from "@hugeicons/react"
import { Payment01Icon } from "@hugeicons/core-free-icons"

const MOVEMENTS_URL =
  "/dashboard/contratos/nao-continuados/empenhos-pagamentos/todos"

export function creditorColumns(): ColumnDef<Creditor>[] {
  return [
    {
      accessorKey: "creditor",
      id: "creditor",
      header: ({ column }) => (
        <DataGridColumnHeader title="Credor" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.creditor}</span>
      ),
      size: 280,
    },
    {
      accessorKey: "object",
      id: "object",
      header: ({ column }) => (
        <DataGridColumnHeader title="Objeto" column={column} />
      ),
      size: 220,
    },
    {
      accessorKey: "year",
      id: "year",
      header: ({ column }) => (
        <DataGridColumnHeader title="Ano" column={column} />
      ),
      // Faceted filter da toolbar entrega array de strings.
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">{row.original.year}</span>
      ),
      size: 90,
    },
    {
      accessorKey: "currentBalance",
      id: "currentBalance",
      header: ({ column }) => (
        <DataGridColumnHeader title="Saldo (R$)" column={column} />
      ),
      // Ordena pelo número, não pelo texto "R$ 1.234,56".
      sortingFn: (a, b) =>
        parseBRL(a.original.currentBalance) -
        parseBRL(b.original.currentBalance),
      cell: ({ row }) => {
        const value = parseBRL(row.original.currentBalance)
        return (
          <span
            className={cn(
              "block text-right font-mono tabular-nums",
              value === 0 && "text-muted-foreground",
              row.original.currentBalance.includes("-") && "text-destructive"
            )}
          >
            {row.original.currentBalance}
          </span>
        )
      },
      size: 150,
    },
    {
      id: "creditorFilter",
      accessorFn: (row) => row.creditor,
      filterFn: (row, id, value: string[]) =>
        !value?.length || value.includes(row.getValue(id) as string),
      meta: { filterOnly: true },
    },
    {
      id: "balanceState",
      accessorFn: (row) =>
        parseBRL(row.currentBalance) > 0 ? "Com saldo" : "Sem saldo",
      filterFn: (row, id, value: string[]) =>
        !value?.length || value.includes(row.getValue(id) as string),
      meta: { filterOnly: true },
    },
    actionsColumn(({ row }) => <CreditorActionsCell creditor={row.original} />),
  ]
}

function CreditorActionsCell({ creditor }: { creditor: Creditor }) {
  const router = useRouter()
  const archive = useArchiveCreditor()
  const [editOpen, setEditOpen] = React.useState(false)
  const { can } = usePermissions()

  return (
    <>
      <DataTableRowActions
        entityLabel="credor"
        extraActions={
          <DropdownMenuItem
            onClick={() =>
              router.push(`${MOVEMENTS_URL}?creditorId=${creditor.creditorId}`)
            }
          >
            <HugeiconsIcon icon={Payment01Icon} strokeWidth={2} />
            Ver movimentos
          </DropdownMenuItem>
        }
        onEdit={
          can(PERMISSIONS.naoContinuadosEditar)
            ? () => setEditOpen(true)
            : undefined
        }
        history={
          can(PERMISSIONS.auditoriaVisualizar)
            ? {
                entity: "creditor",
                recordId: creditor.creditorId,
                subtitle: `${creditor.creditor} · ${creditor.object} · ${creditor.year}`,
              }
            : undefined
        }
        onArchive={
          can(PERMISSIONS.naoContinuadosArquivar)
            ? () => archive.mutateAsync(creditor.creditorId)
            : undefined
        }
      />
      {/* Montado sob demanda — evita instanciar um form por linha da tabela. */}
      {editOpen ? (
        <CreditorFormDialog
          creditor={creditor}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </>
  )
}
