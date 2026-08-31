import { cn } from "@/lib/utils"
import type { MovementQualification } from "@/lib/non-continuous"

export const QUALIFICATION_LABEL: Record<MovementQualification, string> = {
  EMPENHO: "Empenho",
  PAGAMENTO: "Pagamento",
}

const QUALIFICATION_STYLE: Record<MovementQualification, string> = {
  EMPENHO: "bg-info/15 text-info",
  PAGAMENTO: "bg-success/15 text-success",
}

/**
 * Empenho reserva orçamento, pagamento consome. O rótulo por extenso carrega o
 * significado — a cor é só reforço, no mesmo formato do badge de empenho.
 */
export function MovementQualificationBadge({
  qualification,
}: {
  qualification: MovementQualification
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        QUALIFICATION_STYLE[qualification]
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {QUALIFICATION_LABEL[qualification]}
    </span>
  )
}
