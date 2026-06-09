import { cn } from "@/lib/utils"
import type { Contract, ContractStatus } from "@/lib/contracts"

export type DisplayStatus = ContractStatus | "A_VENCER"

export const STATUS_LABEL: Record<DisplayStatus, string> = {
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
export function getDisplayStatus(c: Contract): DisplayStatus {
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

export function ContractStatusBadge({ status }: { status: DisplayStatus }) {
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

/** Badge de dias restantes: vermelho (expirado), amarelo (≤60d), verde (ok). */
export function DaysRemainingBadge({
  days,
  expired,
}: {
  days: number
  expired: boolean
}) {
  const style =
    expired || days <= 0
      ? "bg-destructive/15 text-destructive"
      : days <= 60
        ? "bg-warning/15 text-warning"
        : "bg-success/15 text-success"
  const unit = Math.abs(days) === 1 ? "dia" : "dias"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
        style
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {days} {unit}
    </span>
  )
}
