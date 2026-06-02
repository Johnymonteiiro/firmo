"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import type { Billing } from "@/lib/billings"

export interface BillingColumnsOptions {
  /** contractId -> número do contrato (ex.: "2333/2026"). */
  getContractNumber: (contractId: string) => string
}

const dash = (v: string | null) => v ?? "—"

/** "2026-04" -> "04/2026". */
function formatPeriod(period: string): string {
  const [year, month] = period.split("-")
  return year && month ? `${month}/${year}` : period
}

export function billingColumns({
  getContractNumber,
}: BillingColumnsOptions): ColumnDef<Billing>[] {
  return [
    {
      id: "contract",
      accessorFn: (row) => getContractNumber(row.contractId),
      header: ({ column }) => (
        <DataGridColumnHeader title="Contrato" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium tabular-nums">
          {getContractNumber(row.original.contractId)}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "contractedCompany",
      id: "contractedCompany",
      header: ({ column }) => (
        <DataGridColumnHeader title="Contratada" column={column} />
      ),
      size: 200,
    },
    {
      accessorKey: "billedAmount1",
      id: "billedAmount1",
      header: ({ column }) => (
        <DataGridColumnHeader title="Valor Faturado 1 (R$)" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block text-right font-mono tabular-nums">
          {dash(row.original.billedAmount1)}
        </span>
      ),
      size: 150,
    },
    {
      accessorKey: "sneDeduction1",
      id: "sneDeduction1",
      header: ({ column }) => (
        <DataGridColumnHeader title="SNE Desconta da 1" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {dash(row.original.sneDeduction1)}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "billedAmount2",
      id: "billedAmount2",
      header: ({ column }) => (
        <DataGridColumnHeader title="Valor Faturado 2 (R$)" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block text-right font-mono tabular-nums">
          {dash(row.original.billedAmount2)}
        </span>
      ),
      size: 150,
    },
    {
      accessorKey: "sneDeduction2",
      id: "sneDeduction2",
      header: ({ column }) => (
        <DataGridColumnHeader title="SNE Desconta da 2" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {dash(row.original.sneDeduction2)}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "paymentRequestNumber",
      id: "paymentRequestNumber",
      header: ({ column }) => (
        <DataGridColumnHeader title="Solicitação Pagamento" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {dash(row.original.paymentRequestNumber)}
        </span>
      ),
      size: 160,
    },
    {
      accessorKey: "period",
      id: "period",
      header: ({ column }) => (
        <DataGridColumnHeader title="Competência (mm/aaaa)" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {formatPeriod(row.original.period)}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "paymentProcessNumber",
      id: "paymentProcessNumber",
      header: ({ column }) => (
        <DataGridColumnHeader title="Processo de Pagamento" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {dash(row.original.paymentProcessNumber)}
        </span>
      ),
      size: 180,
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
          {dash(row.original.notes)}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "savedAmount",
      id: "savedAmount",
      header: ({ column }) => (
        <DataGridColumnHeader title="Valor Economizado" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block text-right font-mono tabular-nums">
          {dash(row.original.savedAmount)}
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
            toast.info("Editar faturamento", {
              description: row.original.period,
            })
          }
          onArchive={() =>
            toast.warning("Arquivar faturamento", {
              description: row.original.period,
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
