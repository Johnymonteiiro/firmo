"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { CommitmentStatusBadge } from "@/components/commitments/commitment-status-badge"
import { NewReinforcementDialog } from "@/components/reinforcements/new-reinforcement-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import {
  useArchiveCommitment,
  type Commitment,
  type CommitmentReinforcement,
} from "@/lib/commitments"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"

export interface CommitmentColumnsOptions {
  /** contractId -> número do contrato (ex.: "0097/2026"). */
  getContractNumber: (contractId: string) => string
}

export function commitmentColumns({
  getContractNumber,
}: CommitmentColumnsOptions): ColumnDef<Commitment>[] {
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
      accessorKey: "sne",
      id: "sne",
      header: ({ column }) => (
        <DataGridColumnHeader title="SNE" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">{row.original.sne}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "status",
      id: "status",
      header: ({ column }) => (
        <DataGridColumnHeader title="Status" column={column} />
      ),
      cell: ({ row }) => <CommitmentStatusBadge status={row.original.status} />,
      size: 110,
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
      accessorKey: "reinforcementValue",
      id: "reinforcementValue",
      header: ({ column }) => (
        <DataGridColumnHeader title="Reforços" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block text-right font-mono tabular-nums">
          {row.original.reinforcementValue}
        </span>
      ),
      size: 150,
    },
    {
      // Ordena e filtra pela SNE do reforço mais recente — a que fica visível
      // na linha; as demais saem no dropdown.
      accessorFn: (row) => row.reinforcements[0]?.sne ?? "",
      id: "reinforcementSne",
      header: ({ column }) => (
        <DataGridColumnHeader title="SNE Reforço" column={column} />
      ),
      cell: ({ row }) => (
        <ReinforcementsCell reinforcements={row.original.reinforcements} />
      ),
      size: 170,
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
      accessorKey: "savedAmount",
      id: "savedAmount",
      header: ({ column }) => (
        <DataGridColumnHeader title="Valor Economizado" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block text-right font-mono tabular-nums">
          {row.original.savedAmount}
        </span>
      ),
      size: 160,
    },
    actionsColumn(({ row }) => (
      <CommitmentActionsCell commitment={row.original} />
    )),
  ]
}

/**
 * SNE do reforço mais recente na linha; o dropdown abre os demais. Empenho sem
 * reforço mostra só um traço — nada a abrir.
 */
function ReinforcementsCell({
  reinforcements,
}: {
  reinforcements: CommitmentReinforcement[]
}) {
  const [latest, ...rest] = reinforcements

  if (!latest) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-sm px-1 py-0.5 font-mono tabular-nums hover:bg-accent"
        >
          {latest.sne}
          {rest.length > 0 ? (
            <Badge variant="secondary" className="px-1.5 py-0 font-sans">
              +{rest.length}
            </Badge>
          ) : null}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="size-3.5 opacity-50"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>
          {reinforcements.length === 1
            ? "1 reforço"
            : `${reinforcements.length} reforços`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {reinforcements.map((reinforcement) => (
          <DropdownMenuItem
            key={reinforcement.reinforcementId}
            // Item informativo — não navega nem dispara ação.
            onSelect={(event) => event.preventDefault()}
            className="flex-col items-start gap-0.5"
          >
            <span className="font-mono tabular-nums">{reinforcement.sne}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(reinforcement.reinforcementDate)} ·{" "}
              {reinforcement.value}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CommitmentActionsCell({ commitment }: { commitment: Commitment }) {
  const archive = useArchiveCommitment()
  const [reinforceOpen, setReinforceOpen] = React.useState(false)
  const { can } = usePermissions()

  return (
    <>
      <DataTableRowActions
        entityLabel="empenho"
        extraActions={
          can(PERMISSIONS.reforcosCriar) ? (
            <DropdownMenuItem onClick={() => setReinforceOpen(true)}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
              Adicionar Reforço
            </DropdownMenuItem>
          ) : null
        }
        history={
          can(PERMISSIONS.auditoriaVisualizar)
            ? {
                entity: "commitment",
                recordId: commitment.commitmentId,
                subtitle: `SNE ${commitment.sne} · ${commitment.contractedCompany}`,
              }
            : undefined
        }
        onArchive={
          can(PERMISSIONS.empenhosArquivar)
            ? () => archive.mutateAsync(commitment.commitmentId)
            : undefined
        }
      />
      {/* Dialog controlado com o empenho da linha travado (processo herdado).
          Montado sob demanda — evita instanciar um form por linha da tabela. */}
      {reinforceOpen ? (
        <NewReinforcementDialog
          commitment={commitment}
          open={reinforceOpen}
          onOpenChange={setReinforceOpen}
        />
      ) : null}
    </>
  )
}
