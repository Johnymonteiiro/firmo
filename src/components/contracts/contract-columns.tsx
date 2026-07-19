"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { EditContractDialog } from "@/components/contracts/edit-contract-dialog"
import {
  ContractStatusBadge,
  DaysRemainingBadge,
  getDisplayStatus,
  STATUS_LABEL,
} from "@/components/contracts/contract-status-badge"
import {
  useArchiveContract,
  useChangeContractStatus,
  type Contract,
} from "@/lib/contracts"
import { useRouter } from "next/navigation"

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
    cell: ({ row }) => (
      <ContractStatusBadge status={getDisplayStatus(row.original)} />
    ),
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
      <DaysRemainingBadge
        days={row.original.daysRemaining}
        expired={row.original.isExpired}
      />
    ),
    size: 110,
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
  actionsColumn(({ row }) => <ContractActionsCell contract={row.original} />),
]

function ContractActionsCell({ contract }: { contract: Contract }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = React.useState(false)
  const archive = useArchiveContract()
  const changeStatus = useChangeContractStatus()

  return (
    <>
      <DataTableRowActions
        entityLabel="contrato"
        onDetails={() =>
          router.push(
            `/dashboard/contratos/continuados/relacao-contratos/${contract.contractId}`
          )
        }
        onEdit={() => setEditOpen(true)}
        onChangeStatus={(status) =>
          changeStatus.mutateAsync({
            contractId: contract.contractId,
            status,
          })
        }
        currentStatus={contract.status}
        history={{
          entity: "contract",
          recordId: contract.contractId,
          subtitle: `Nº ${contract.contractNumber} · ${contract.company}`,
        }}
        onArchive={() => archive.mutateAsync(contract.contractId)}
      />
      <EditContractDialog
        contract={contract}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
