"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import {
  CommitmentStatusBadge,
  COMMITMENT_STATUS_LABEL,
} from "@/components/commitments/commitment-status-badge"
import { EditCommitmentDialog } from "@/components/commitments/edit-commitment-dialog"
import { NewReinforcementDialog } from "@/components/reinforcements/new-reinforcement-dialog"
import { EditReinforcementDialog } from "@/components/reinforcements/edit-reinforcement-dialog"
import { ReinforcementStatusBadge } from "@/components/reinforcements/reinforcement-status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatDate, parseBRL } from "@/lib/format"
import {
  useArchiveCommitment,
  type Commitment,
  type CommitmentReinforcement,
} from "@/lib/commitments"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"
import {
  nextReinforcementStatus,
  REINFORCEMENT_STATUS_FLOW,
  REINFORCEMENT_STATUS_LABEL,
  useChangeReinforcementStatus,
  type EditableReinforcement,
} from "@/lib/reinforcements"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons"

/** Filtro multi-seleção (valor = array de strings). */
function inArrayFilter(
  row: { getValue: (id: string) => unknown },
  id: string,
  value: string[]
) {
  return !value?.length || value.includes(row.getValue(id) as string)
}

/** Rótulos do consumo do empenho, na ordem em que aparecem no filtro. */
export const CONSUMPTION_BUCKETS = [
  "Sem consumo",
  "Até 50%",
  "51 a 85%",
  "Acima de 85%",
  "Esgotado",
] as const

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
      id: "status",
      accessorFn: (row) => COMMITMENT_STATUS_LABEL[row.status],
      header: ({ column }) => (
        <DataGridColumnHeader title="Status" column={column} />
      ),
      cell: ({ row }) => <CommitmentStatusBadge status={row.original.status} />,
      filterFn: inArrayFilter,
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
      cell: ({ row }) => <ReinforcementsCell commitment={row.original} />,
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
    {
      // Só filtro — a coluna Contrato já mostra o número e ordena por ele.
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
      // O ano do empenho está nos quatro primeiros dígitos da SNE.
      id: "sneYear",
      accessorFn: (row) => row.sne.slice(0, 4),
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    {
      id: "consumption",
      accessorFn: (row) => consumptionBucket(row),
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    {
      id: "reinforcementStatus",
      // Um empenho pode ter reforços em etapas diferentes; entram todas, para
      // "tem reforço em DGER" encontrar o empenho.
      accessorFn: (row) =>
        row.reinforcements
          .map((item) => REINFORCEMENT_STATUS_LABEL[item.status])
          .join(", "),
      filterFn: (row, id, value: string[]) => {
        if (!value?.length) return true
        const cell = (row.getValue(id) as string) ?? ""
        return value.some((option) => cell.split(", ").includes(option))
      },
      meta: { filterOnly: true },
    },
    actionsColumn(({ row }) => (
      <CommitmentActionsCell commitment={row.original} />
    )),
  ]
}

/**
 * SNE do reforço mais recente na linha; o dropdown abre os demais e é de onde
 * se mexe em cada um — editar e mover etapa. Ficava no histórico do empenho,
 * mas lá dependia de `auditoria:visualizar` para sequer aparecer, e "Histórico"
 * não anuncia que ali se muda a tramitação. Empenho sem reforço mostra só um
 * traço — nada a abrir.
 */
function ReinforcementsCell({ commitment }: { commitment: Commitment }) {
  const { can } = usePermissions()
  const changeStatus = useChangeReinforcementStatus()
  const [editing, setEditing] = React.useState<EditableReinforcement | null>(
    null
  )

  const canEdit = can(PERMISSIONS.reforcosEditar)
  const canChangeStatus = can(PERMISSIONS.reforcosAlterarStatus)
  const canMoveBackward = can(PERMISSIONS.reforcosRetrocederStatus)

  const reinforcements = commitment.reinforcements
  const [latest, ...rest] = reinforcements

  if (!latest) {
    return <span className="text-muted-foreground">—</span>
  }

  /** O processo é o do empenho pai — o reforço não tem um próprio. */
  const toEditable = (
    reinforcement: CommitmentReinforcement
  ): EditableReinforcement => ({
    reinforcementId: reinforcement.reinforcementId,
    sne: reinforcement.sne,
    value: reinforcement.value,
    reinforcementDate: reinforcement.reinforcementDate,
    status: reinforcement.status,
    processNumber: commitment.processNumber,
  })

  /**
   * Sem a permissão de retroceder, a única transição oferecida é a próxima do
   * fluxo — as demais o backend recusaria com 422.
   */
  const optionsFor = (reinforcement: CommitmentReinforcement) => {
    if (!canChangeStatus) return []
    if (canMoveBackward) {
      return REINFORCEMENT_STATUS_FLOW.filter(
        (status) => status !== reinforcement.status
      )
    }
    const next = nextReinforcementStatus(reinforcement.status)
    return next ? [next] : []
  }

  return (
    <>
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

        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>
            {reinforcements.length === 1
              ? "1 reforço"
              : `${reinforcements.length} reforços`}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {reinforcements.map((reinforcement) => {
            const options = optionsFor(reinforcement)
            const hasAction = canEdit || options.length > 0

            const resumo = (
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-mono tabular-nums">
                    {reinforcement.sne}
                  </span>
                  <ReinforcementStatusBadge status={reinforcement.status} />
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(reinforcement.reinforcementDate)} ·{" "}
                  {reinforcement.value}
                </span>
              </span>
            )

            // Sem permissão nenhuma o item continua sendo só informação — um
            // submenu vazio seria uma promessa falsa.
            if (!hasAction) {
              return (
                <DropdownMenuItem
                  key={reinforcement.reinforcementId}
                  onSelect={(event) => event.preventDefault()}
                  className="flex-col items-start gap-1"
                >
                  {resumo}
                </DropdownMenuItem>
              )
            }

            return (
              <DropdownMenuSub key={reinforcement.reinforcementId}>
                <DropdownMenuSubTrigger>{resumo}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-52">
                  {canEdit ? (
                    <DropdownMenuItem
                      onClick={() => setEditing(toEditable(reinforcement))}
                    >
                      <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                      Editar
                    </DropdownMenuItem>
                  ) : null}

                  {options.length > 0 ? (
                    <>
                      {canEdit ? <DropdownMenuSeparator /> : null}
                      <DropdownMenuLabel className="text-2xs font-semibold tracking-[0.07em] text-muted-foreground uppercase">
                        Mover etapa
                      </DropdownMenuLabel>
                      {options.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          disabled={changeStatus.isPending}
                          onClick={() =>
                            changeStatus.mutate({
                              reinforcementId: reinforcement.reinforcementId,
                              status,
                            })
                          }
                        >
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            strokeWidth={2}
                          />
                          {REINFORCEMENT_STATUS_LABEL[status]}
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : null}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {editing ? (
        <EditReinforcementDialog
          reinforcement={editing}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(null)
          }}
        />
      ) : null}
    </>
  )
}

function CommitmentActionsCell({ commitment }: { commitment: Commitment }) {
  const archive = useArchiveCommitment()
  const [reinforceOpen, setReinforceOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const { can } = usePermissions()

  return (
    <>
      <DataTableRowActions
        entityLabel="empenho"
        onEdit={
          can(PERMISSIONS.empenhosEditar) ? () => setEditOpen(true) : undefined
        }
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
      {editOpen ? (
        <EditCommitmentDialog
          commitment={commitment}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </>
  )
}

/**
 * Quanto do liberado (inicial + reforços) já saiu. Os valores vêm em BRL do
 * backend, daí o `parseBRL`; liberado zero conta como esgotado, como no painel.
 */
function consumptionBucket(commitment: Commitment): string {
  const released =
    parseBRL(commitment.initialValue) + parseBRL(commitment.reinforcementValue)
  const balance = parseBRL(commitment.currentBalance)
  if (released <= 0 || balance <= 0) return "Esgotado"

  const consumed = 1 - balance / released
  if (consumed <= 0) return "Sem consumo"
  if (consumed <= 0.5) return "Até 50%"
  if (consumed <= 0.85) return "51 a 85%"
  return "Acima de 85%"
}
