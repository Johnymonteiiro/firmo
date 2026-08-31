"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { EditReinforcementDialog } from "@/components/reinforcements/edit-reinforcement-dialog"
import { ReinforcementStatusBadge } from "@/components/reinforcements/reinforcement-status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"
import {
  nextReinforcementStatus,
  REINFORCEMENT_STATUS_FLOW,
  REINFORCEMENT_STATUS_LABEL,
  useAnnulReinforcement,
  useChangeReinforcementStatus,
  useReinforcements,
  type Reinforcement,
  type ReinforcementStatus,
} from "@/lib/reinforcements"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  MoreHorizontalCircle01Icon,
  PencilEdit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

/**
 * Reforços ativos do empenho: etapa da tramitação, edição, avanço de etapa e
 * anulação.
 *
 * A anulação é a única ação definitiva — e o backend só a aceita para reforço
 * de ano anterior, então o item fica desabilitado com o motivo no title.
 */
export function CommitmentReinforcementsPanel({
  commitmentId,
}: {
  commitmentId: string
}) {
  const { data, isLoading } = useReinforcements(1, 100, commitmentId)
  const annul = useAnnulReinforcement()
  const changeStatus = useChangeReinforcementStatus()
  const queryClient = useQueryClient()
  const [target, setTarget] = React.useState<Reinforcement | null>(null)
  const [editing, setEditing] = React.useState<Reinforcement | null>(null)
  const { can } = usePermissions()

  const canEdit = can(PERMISSIONS.reforcosEditar)
  const canChangeStatus = can(PERMISSIONS.reforcosAlterarStatus)
  const canMoveBackward = can(PERMISSIONS.reforcosRetrocederStatus)
  const canAnnul = can(PERMISSIONS.reforcosAnular)

  const currentYear = new Date().getFullYear()
  const reinforcements = data?.data ?? []

  function handleAnnul() {
    if (!target) return
    annul.mutate(target.reinforcementId, {
      onSuccess: () => {
        // a anulação gera evento novo na trilha de auditoria
        queryClient.invalidateQueries({ queryKey: ["audit"] })
        setTarget(null)
      },
    })
  }

  function handleChangeStatus(
    reinforcement: Reinforcement,
    status: ReinforcementStatus
  ) {
    changeStatus.mutate(
      { reinforcementId: reinforcement.reinforcementId, status },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: ["audit"] }),
      }
    )
  }

  if (isLoading) {
    return <Skeleton className="h-16 w-full" />
  }
  if (reinforcements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum reforço ativo neste empenho.
      </p>
    )
  }

  return (
    <>
      <ul className="space-y-1.5">
        {reinforcements.map((reinforcement) => {
          const year = new Date(
            reinforcement.reinforcementDate
          ).getUTCFullYear()
          const annullable = canAnnul && year < currentYear
          const next = nextReinforcementStatus(reinforcement.status)

          // Sem a permissão de retroceder, a única transição oferecida é a
          // próxima etapa — as demais o backend recusaria com 422.
          const options: ReinforcementStatus[] = canMoveBackward
            ? REINFORCEMENT_STATUS_FLOW.filter(
                (status) => status !== reinforcement.status
              )
            : next
              ? [next]
              : []

          const hasMenu =
            canEdit || (canChangeStatus && options.length > 0) || canAnnul

          return (
            <li
              key={reinforcement.reinforcementId}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm tabular-nums">
                  SNE {reinforcement.sne} · {reinforcement.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(reinforcement.reinforcementDate)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <ReinforcementStatusBadge status={reinforcement.status} />

                {hasMenu ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="size-7" size="icon" variant="ghost">
                        <HugeiconsIcon
                          icon={MoreHorizontalCircle01Icon}
                          strokeWidth={2}
                        />
                        <span className="sr-only">Ações do reforço</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      {canEdit ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => setEditing(reinforcement)}
                          >
                            <HugeiconsIcon
                              icon={PencilEdit02Icon}
                              strokeWidth={2}
                            />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      ) : null}

                      {canChangeStatus && options.length > 0 ? (
                        <>
                          <DropdownMenuLabel className="text-2xs font-semibold tracking-[0.07em] text-muted-foreground uppercase">
                            Mover etapa
                          </DropdownMenuLabel>
                          {options.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              disabled={changeStatus.isPending}
                              onClick={() =>
                                handleChangeStatus(reinforcement, status)
                              }
                            >
                              <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                strokeWidth={2}
                              />
                              {REINFORCEMENT_STATUS_LABEL[status]}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      ) : null}

                      {canAnnul ? (
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={!annullable}
                          title={
                            annullable
                              ? undefined
                              : `Reforço de ${year} só pode ser anulado a partir de ${year + 1}.`
                          }
                          onClick={() => setTarget(reinforcement)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                          Anular
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {editing ? (
        <EditReinforcementDialog
          reinforcement={editing}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => {
          if (!o) setTarget(null)
        }}
        title="Anular reforço?"
        description={
          target
            ? `O reforço SNE ${target.sne}, de ${target.value} (${formatDate(target.reinforcementDate)}), será anulado e o valor sairá do saldo do empenho. Esta ação é DEFINITIVA — não pode ser desfeita.`
            : ""
        }
        confirmLabel="Anular"
        pendingLabel="Anulando…"
        destructive
        isPending={annul.isPending}
        onConfirm={handleAnnul}
      />
    </>
  )
}
