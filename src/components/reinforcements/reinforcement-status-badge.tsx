import { cn } from "@/lib/utils"
import {
  REINFORCEMENT_STATUS_LABEL,
  type ReinforcementStatus,
} from "@/lib/reinforcements"

/**
 * Cor por etapa, e não por gravidade: DGER e SE/DCF são estados normais de um
 * processo em andamento — nenhum dos dois é um problema. O contraste fica
 * entre "andando" (âmbar/azul) e "fechado" (verde), que é a leitura útil.
 */
const STATUS_STYLE: Record<ReinforcementStatus, string> = {
  DGER: "bg-warning/15 text-warning",
  SE_DCF: "bg-viz-cat-1/15 text-viz-cat-1",
  CONCLUIDO: "bg-success/15 text-success",
}

export function ReinforcementStatusBadge({
  status,
  className,
}: {
  status: ReinforcementStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLE[status],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {REINFORCEMENT_STATUS_LABEL[status]}
    </span>
  )
}
