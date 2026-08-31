"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { useArchiveBilling, type Billing } from "@/lib/billings"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"

export interface BillingColumnsOptions {
  /** contractId -> número do contrato (ex.: "2333/2026"). */
  getContractNumber: (contractId: string) => string
}

const dash = (v: string | null) => v ?? "—"

/** Filtro multi-seleção (valor = array de strings). */
function inArrayFilter(
  row: { getValue: (id: string) => unknown },
  id: string,
  value: string[]
) {
  return !value?.length || value.includes(row.getValue(id) as string)
}

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
      id: "contractFilter",
      accessorFn: (row) => getContractNumber(row.contractId),
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    {
      id: "companyFilter",
      accessorFn: (row) => row.contractedCompany,
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    {
      // O ano da competência: filtrar "2026" é mais útil que escolher os doze
      // meses um a um, e o filtro de competência já cobre o mês exato.
      id: "periodYear",
      accessorFn: (row) => row.period.slice(0, 4),
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    {
      id: "periodFilter",
      accessorFn: (row) => formatPeriod(row.period),
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    actionsColumn(({ row }) => <BillingActionsCell billing={row.original} />),
  ]
}

function BillingActionsCell({ billing }: { billing: Billing }) {
  const archive = useArchiveBilling()
  const { can } = usePermissions()
  return (
    <DataTableRowActions
      entityLabel="faturamento"
      history={
        can(PERMISSIONS.auditoriaVisualizar)
          ? {
              entity: "billing",
              recordId: billing.billingId,
              subtitle: `Competência ${billing.period} · ${billing.contractedCompany}`,
            }
          : undefined
      }
      onArchive={
        can(PERMISSIONS.faturamentosArquivar)
          ? () => archive.mutateAsync(billing.billingId)
          : undefined
      }
    />
  )
}
