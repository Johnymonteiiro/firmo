"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api"
import { formatDate } from "@/lib/format"
import {
  useAnnulReinforcement,
  useReinforcements,
  type Reinforcement,
} from "@/lib/reinforcements"

/**
 * Reforços ativos do empenho, com a ação "Anular" (definitiva).
 * Regra do backend: só anula reforço de ano anterior ao atual — o botão
 * fica desabilitado para reforços do ano corrente.
 */
export function CommitmentReinforcementsPanel({
  commitmentId,
}: {
  commitmentId: string
}) {
  const { data, isLoading } = useReinforcements(1, 100, commitmentId)
  const annul = useAnnulReinforcement()
  const queryClient = useQueryClient()
  const [target, setTarget] = React.useState<Reinforcement | null>(null)

  const currentYear = new Date().getFullYear()
  const reinforcements = data?.data ?? []

  function handleAnnul() {
    if (!target) return
    annul.mutate(target.reinforcementId, {
      onSuccess: () => {
        toast.success("Reforço anulado.")
        // a anulação gera evento novo na trilha de auditoria
        queryClient.invalidateQueries({ queryKey: ["audit"] })
        setTarget(null)
      },
      onError: (err) => {
        toast.error(
          err instanceof ApiError
            ? err.message
            : "Não foi possível anular o reforço."
        )
      },
    })
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
        {reinforcements.map((r) => {
          const year = new Date(r.reinforcementDate).getUTCFullYear()
          const canAnnul = year < currentYear
          return (
            <li
              key={r.reinforcementId}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm tabular-nums">{r.value}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(r.reinforcementDate)}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="shrink-0 text-destructive hover:text-destructive"
                disabled={!canAnnul}
                title={
                  canAnnul
                    ? undefined
                    : `Reforço de ${year} só pode ser anulado a partir de ${year + 1}.`
                }
                onClick={() => setTarget(r)}
              >
                Anular
              </Button>
            </li>
          )
        })}
      </ul>

      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => {
          if (!o) setTarget(null)
        }}
        title="Anular reforço?"
        description={
          target
            ? `O reforço de ${target.value} (${formatDate(target.reinforcementDate)}) será anulado e o valor sairá do saldo do empenho. Esta ação é DEFINITIVA — não pode ser desfeita.`
            : ""
        }
        confirmLabel="Anular"
        destructive
        isPending={annul.isPending}
        onConfirm={handleAnnul}
      />
    </>
  )
}
