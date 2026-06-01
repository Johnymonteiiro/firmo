"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { cn } from "@/lib/utils"
import type { Contract, ContractStatus } from "@/lib/contracts"

type DisplayStatus = ContractStatus | "A_VENCER"

const STATUS_LABEL: Record<DisplayStatus, string> = {
  VIGENTE: "Vigente",
  A_VENCER: "A vencer",
  ENCERRADO: "Encerrado",
  EXPIRADO: "Expirado",
}

const STATUS_STYLE: Record<DisplayStatus, string> = {
  VIGENTE: "bg-success/15 text-success",
  A_VENCER: "bg-warning/15 text-warning",
  ENCERRADO: "bg-muted text-muted-foreground",
  EXPIRADO: "bg-destructive/15 text-destructive",
}

/** Status exibido: "A vencer" quando vigente e a ≤60 dias do vencimento. */
function getDisplayStatus(c: Contract): DisplayStatus {
  if (
    c.status === "VIGENTE" &&
    !c.isExpired &&
    c.daysRemaining > 0 &&
    c.daysRemaining <= 60
  ) {
    return "A_VENCER"
  }
  return c.status
}

function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLE[status]
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  )
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

/** Filtro multi-seleção (valor = array de strings). */
function inArrayFilter(
  row: { getValue: (id: string) => unknown },
  id: string,
  value: string[]
) {
  return !value?.length || value.includes(row.getValue(id) as string)
}

export const contractColumns: ColumnDef<Contract>[] = [
  {
    accessorKey: "contractNumber",
    id: "contractNumber",
    header: ({ column }) => (
      <DataGridColumnHeader title="Contrato" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-medium tabular-nums">
        {row.original.contractNumber}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "company",
    id: "company",
    header: ({ column }) => (
      <DataGridColumnHeader title="Empresa" column={column} />
    ),
    size: 190,
  },
  {
    accessorKey: "subject",
    id: "subject",
    header: ({ column }) => (
      <DataGridColumnHeader title="Objeto" column={column} />
    ),
    cell: ({ row }) => (
      <span className="block max-w-65 truncate" title={row.original.subject}>
        {row.original.subject}
      </span>
    ),
    size: 240,
  },
  {
    accessorKey: "manager",
    id: "manager",
    header: ({ column }) => (
      <DataGridColumnHeader title="Gestor" column={column} />
    ),
    size: 150,
  },
  {
    id: "status",
    accessorFn: (row) => STATUS_LABEL[getDisplayStatus(row)],
    header: ({ column }) => (
      <DataGridColumnHeader title="Status" column={column} />
    ),
    cell: ({ row }) => <StatusBadge status={getDisplayStatus(row.original)} />,
    filterFn: inArrayFilter,
    size: 110,
  },
  {
    accessorKey: "effectiveMonthlyValue",
    id: "monthlyValue",
    header: ({ column }) => (
      <DataGridColumnHeader title="Valor Mensal" column={column} />
    ),
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">
        {row.original.effectiveMonthlyValue}
      </span>
    ),
    size: 130,
  },
  {
    accessorKey: "expiresAt",
    id: "expiresAt",
    header: ({ column }) => (
      <DataGridColumnHeader title="Vencimento" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.original.expiresAt)}
      </span>
    ),
    size: 120,
  },
  {
    accessorKey: "daysRemaining",
    id: "daysRemaining",
    header: ({ column }) => (
      <DataGridColumnHeader title="Dias Rest." column={column} />
    ),
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">
        {row.original.daysRemaining}
      </span>
    ),
    size: 100,
  },
  {
    id: "hasAdjustment",
    accessorFn: (row) => (row.hasAdjustment === "SIM" ? "Sim" : "Não"),
    header: ({ column }) => (
      <DataGridColumnHeader title="Ocorreu Ajuste" column={column} />
    ),
    filterFn: inArrayFilter,
    size: 120,
  },
  {
    accessorKey: "adjustmentMonthYear",
    id: "adjustmentMonthYear",
    header: ({ column }) => (
      <DataGridColumnHeader title="Mês/Ano Reajuste" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {row.original.adjustmentMonthYear ?? "—"}
      </span>
    ),
    size: 130,
  },
  {
    accessorKey: "adjustedMonthlyValue",
    id: "adjustedMonthlyValue",
    header: ({ column }) => (
      <DataGridColumnHeader title="Valor Após Reajuste" column={column} />
    ),
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">
        {row.original.adjustedMonthlyValue ?? "—"}
      </span>
    ),
    size: 150,
  },
  {
    accessorKey: "notes",
    id: "notes",
    header: ({ column }) => (
      <DataGridColumnHeader title="Observação" column={column} />
    ),
    cell: ({ row }) => (
      <span
        className="block max-w-65 truncate"
        title={row.original.notes ?? undefined}
      >
        {row.original.notes ?? "—"}
      </span>
    ),
    size: 180,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <DataTableRowActions
        onEdit={() =>
          toast.info("Editar contrato", {
            description: row.original.contractNumber,
          })
        }
        onArchive={() =>
          toast.warning("Arquivar contrato", {
            description: row.original.contractNumber,
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
