"use client"

import * as React from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDashboard } from "@/lib/dashboard"
import { REINFORCEMENT_STATUS_LABEL } from "@/lib/reinforcements"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  Notification03Icon,
  Time04Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

const CONTRACTS_URL =
  "/dashboard/contratos/continuados/relacao-contratos/todos"
const COMMITMENTS_URL =
  "/dashboard/contratos/continuados/empenhos-saldos/empenhos/todos"

/** Dias a partir dos quais um vencimento vira aviso. */
const DUE_SOON_DAYS = 60
/** Proporção consumida do empenho a partir da qual vira aviso. */
const LOW_BALANCE_RATIO = 0.85

type Severity = "atencao" | "alerta"

interface Notice {
  id: string
  icon: typeof Alert02Icon
  severity: Severity
  title: string
  detail: string
  href: string
}

const SEVERITY_CLASS: Record<Severity, string> = {
  atencao: "text-warning",
  alerta: "text-destructive",
}

/**
 * Avisos derivados do que o painel já calcula — contratos perto do vencimento,
 * empenhos quase consumidos e reforços que ainda não fecharam a tramitação.
 *
 * Não há tabela de notificação nem "marcar como lida": o aviso existe enquanto
 * o fato que o gerou existir, e some quando o contrato é renovado, o empenho é
 * reforçado ou o reforço chega a Concluído. É honesto com o que o sistema
 * sabe hoje — guardar "lido" exigiria onde gravar.
 */
function buildNotices(
  data: ReturnType<typeof useDashboard>["data"]
): Notice[] {
  if (!data) return []
  const notices: Notice[] = []

  for (const contract of data.contracts?.expiringSoon ?? []) {
    if (contract.daysRemaining > DUE_SOON_DAYS) continue
    const expired = contract.daysRemaining < 0
    notices.push({
      id: `contrato-${contract.contractId}`,
      icon: Time04Icon,
      severity: expired || contract.daysRemaining <= 30 ? "alerta" : "atencao",
      title: expired
        ? `Venceu há ${Math.abs(contract.daysRemaining)} dias`
        : contract.daysRemaining === 0
          ? "Vence hoje"
          : `Vence em ${contract.daysRemaining} dias`,
      detail: `${contract.contractNumber} · ${contract.company}`,
      href: `/dashboard/contratos/continuados/relacao-contratos/${contract.contractId}`,
    })
  }

  for (const commitment of data.commitments?.lowBalance ?? []) {
    if (commitment.consumedRatio < LOW_BALANCE_RATIO) continue
    notices.push({
      id: `empenho-${commitment.commitmentId}`,
      icon: Wallet01Icon,
      severity: commitment.consumedRatio >= 1 ? "alerta" : "atencao",
      title: `Empenho ${Math.round(commitment.consumedRatio * 100)}% consumido`,
      detail: `SNE ${commitment.sne} · ${commitment.contractNumber}`,
      href: COMMITMENTS_URL,
    })
  }

  for (const reinforcement of data.reinforcements?.pending ?? []) {
    notices.push({
      id: `reforco-${reinforcement.reinforcementId}`,
      icon: Alert02Icon,
      severity: "atencao",
      title: `Reforço parado em ${REINFORCEMENT_STATUS_LABEL[reinforcement.status]} há ${reinforcement.daysInStatus} dias`,
      detail: `SNE ${reinforcement.sne} · ${reinforcement.contractNumber}`,
      href: COMMITMENTS_URL,
    })
  }

  return notices
}

export function NotificationsBell() {
  const year = React.useMemo(() => new Date().getFullYear(), [])
  const { data, isLoading } = useDashboard(year)

  const notices = React.useMemo(() => buildNotices(data), [data])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            notices.length > 0
              ? `Notificações (${notices.length})`
              : "Notificações"
          }
        >
          <HugeiconsIcon icon={Notification03Icon} strokeWidth={1.8} />
          {notices.length > 0 ? (
            <Badge
              // O número é redundante com a lista, mas é o que faz a pessoa
              // abrir: sem ele o sino não se distingue de um sino vazio.
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-2xs tabular-nums"
              variant="destructive"
            >
              {notices.length > 9 ? "9+" : notices.length}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-88 p-0">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <p className="text-sm font-medium">Notificações</p>
          {notices.length > 0 ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {notices.length}{" "}
              {notices.length === 1 ? "aviso" : "avisos"}
            </span>
          ) : null}
        </div>

        {isLoading && !data ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Carregando…
          </p>
        ) : notices.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nada exigindo atenção agora.
          </p>
        ) : (
          <ul className="max-h-96 divide-y overflow-y-auto">
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={notice.href}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <HugeiconsIcon
                    icon={notice.icon}
                    strokeWidth={1.8}
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      SEVERITY_CLASS[notice.severity]
                    )}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{notice.title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {notice.detail}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t px-4 py-2.5">
          <Link
            href={CONTRACTS_URL}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Ver contratos
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
