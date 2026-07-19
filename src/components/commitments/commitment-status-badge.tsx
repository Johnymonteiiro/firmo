import { cn } from "@/lib/utils"
import type { CommitmentStatus } from "@/lib/commitments"

export const COMMITMENT_STATUS_LABEL: Record<CommitmentStatus, string> = {
  VIGENTE: "Vigente",
  SALDO: "Saldo",
  ENCERRADO: "Encerrado",
}

const STATUS_STYLE: Record<CommitmentStatus, string> = {
  VIGENTE: "bg-success/15 text-success",
  SALDO: "bg-warning/15 text-warning",
  ENCERRADO: "bg-muted text-muted-foreground",
}

/**
 * Status derivado do empenho (calculado no backend): VIGENTE (ano atual),
 * SALDO (ano anterior com saldo remanescente) ou ENCERRADO (saldo zerado).
 */
export function CommitmentStatusBadge({
  status,
}: {
  status: CommitmentStatus
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLE[status]
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {COMMITMENT_STATUS_LABEL[status]}
    </span>
  )
}
