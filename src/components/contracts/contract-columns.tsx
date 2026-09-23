"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { AdjustContractDialog } from "@/components/contracts/adjust-contract-dialog"
import { EditContractDialog } from "@/components/contracts/edit-contract-dialog"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, MoneyBag02Icon } from "@hugeicons/core-free-icons"
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
import { PERMISSIONS, usePermissions } from "@/lib/permissions"
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
    // `managers` é uma lista de { userId, name } — a coluna ordena e filtra
    // pelos nomes, que são o texto legado quando não há vínculo com usuário.
    accessorFn: (row) => row.managers.map((ref) => ref.name).join(", "),
    id: "manager",
    header: ({ column }) => (
      <DataGridColumnHeader title="Gestores" column={column} />
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
    // O valor original do contrato. O que vale hoje sai da coluna "Valor Após
    // Reajuste", que abre o histórico inteiro.
    accessorKey: "monthlyValue",
    id: "monthlyValue",
    header: ({ column }) => (
      <DataGridColumnHeader title="Valor Mensal" column={column} />
    ),
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">
        {row.original.monthlyValue}
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
    // Ordena e busca pelo reajuste mais recente — o que fica visível na
    // linha; o histórico inteiro sai no dropdown.
    accessorFn: (row) => row.adjustedMonthlyValue ?? "",
    id: "adjustedMonthlyValue",
    header: ({ column }) => (
      <DataGridColumnHeader title="Valor Após Reajuste" column={column} />
    ),
    cell: ({ row }) => <AdjustmentsCell contract={row.original} />,
    size: 170,
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
    // Só filtro: a coluna "Dias Rest." continua mostrando o número e
    // ordenando por ele; a faixa é para escolher no filtro.
    id: "dueBucket",
    accessorFn: (row) => dueBucket(row),
    filterFn: inArrayFilter,
    meta: { filterOnly: true },
  },
  {
    id: "companyFilter",
    accessorFn: (row) => row.company,
    filterFn: inArrayFilter,
    meta: { filterOnly: true },
  },
  {
    id: "managerFilter",
    accessorFn: (row) => row.managers.map((ref) => ref.name).join(", "),
    filterFn: inArrayFilter,
    meta: { filterOnly: true },
  },
  actionsColumn(({ row }) => <ContractActionsCell contract={row.original} />),
]

/** Rótulos da faixa de vencimento, na ordem em que aparecem no filtro. */
export const DUE_BUCKETS = [
  "Vencido",
  "Até 30 dias",
  "31 a 60 dias",
  "61 a 90 dias",
  "Mais de 90 dias",
  "Encerrado",
] as const

function dueBucket(contract: Contract): string {
  if (getDisplayStatus(contract) === "ENCERRADO") return "Encerrado"
  if (contract.isExpired || contract.daysRemaining < 0) return "Vencido"
  if (contract.daysRemaining <= 30) return "Até 30 dias"
  if (contract.daysRemaining <= 60) return "31 a 60 dias"
  if (contract.daysRemaining <= 90) return "61 a 90 dias"
  return "Mais de 90 dias"
}

/**
 * Reajuste mais recente na linha, `+N` quando há mais, e o dropdown abre o
 * histórico inteiro — mesmo desenho da coluna "SNE Reforço" de empenhos.
 * Contrato sem reajuste mostra só um traço.
 */
function AdjustmentsCell({ contract }: { contract: Contract }) {
  const adjustments = contract.adjustments
  const latest = adjustments.at(-1)

  if (!latest) {
    return <span className="block text-right text-muted-foreground">—</span>
  }

  const rest = adjustments.length - 1

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-end gap-1.5 rounded-sm px-1 py-0.5 font-mono tabular-nums hover:bg-accent"
        >
          {latest.monthlyValue}
          {rest > 0 ? (
            <Badge variant="secondary" className="px-1.5 py-0 font-sans">
              +{rest}
            </Badge>
          ) : null}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="size-3.5 opacity-50"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          {adjustments.length === 1
            ? "1 reajuste"
            : `${adjustments.length} reajustes`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {[...adjustments].reverse().map((adjustment) => (
          <DropdownMenuItem
            key={adjustment.monthYear}
            onSelect={(event) => event.preventDefault()}
            className="flex items-center justify-between gap-3"
          >
            <span className="font-mono tabular-nums">
              {adjustment.monthYear}
            </span>
            <span className="font-mono tabular-nums">
              {adjustment.monthlyValue}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between gap-3 px-2 py-1.5 text-sm font-medium">
          <span>Valor mensal original</span>
          <span className="font-mono tabular-nums">
            {contract.monthlyValue}
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ContractActionsCell({ contract }: { contract: Contract }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = React.useState(false)
  const [adjustOpen, setAdjustOpen] = React.useState(false)
  const archive = useArchiveContract()
  const changeStatus = useChangeContractStatus()
  const { can } = usePermissions()
  const canEdit = can(PERMISSIONS.contratosEditar)

  return (
    <>
      <DataTableRowActions
        entityLabel="contrato"
        extraActions={
          canEdit ? (
            <DropdownMenuItem onClick={() => setAdjustOpen(true)}>
              <HugeiconsIcon icon={MoneyBag02Icon} strokeWidth={2} />
              Reajustar valor mensal
            </DropdownMenuItem>
          ) : null
        }
        onDetails={() =>
          router.push(
            `/dashboard/contratos/continuados/relacao-contratos/${contract.contractId}`
          )
        }
        onEdit={canEdit ? () => setEditOpen(true) : undefined}
        onChangeStatus={
          canEdit
            ? (status) =>
                changeStatus.mutateAsync({
                  contractId: contract.contractId,
                  status,
                })
            : undefined
        }
        currentStatus={contract.status}
        history={
          can(PERMISSIONS.auditoriaVisualizar)
            ? {
                entity: "contract",
                recordId: contract.contractId,
                subtitle: `Nº ${contract.contractNumber} · ${contract.company}`,
              }
            : undefined
        }
        onArchive={
          can(PERMISSIONS.contratosArquivar)
            ? () => archive.mutateAsync(contract.contractId)
            : undefined
        }
      />
      <EditContractDialog
        contract={contract}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      {/* Montado sob demanda — um form por linha da tabela seria desperdício. */}
      {adjustOpen ? (
        <AdjustContractDialog
          contract={contract}
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
        />
      ) : null}
    </>
  )
}
