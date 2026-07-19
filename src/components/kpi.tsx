import * as React from "react"
import type { IconSvgElement } from "@hugeicons/react"
import { HugeiconsIcon } from "@hugeicons/react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type KpiTone = "default" | "success" | "warning" | "destructive"

const TONE_ICON: Record<KpiTone, string> = {
  default: "bg-secondary text-muted-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
}

export interface KpiCardProps {
  /** Rótulo curto, sentence case, sem dois-pontos (ex.: "Total de contratos"). */
  label: string
  /** Valor principal — número/moeda já formatado. */
  value: React.ReactNode
  /** Contexto complementar (ex.: "3 vigentes · 1 encerrado"). */
  hint?: React.ReactNode
  icon?: IconSvgElement
  /** Acento do ícone; o significado é sempre carregado pelo rótulo, não pela cor. */
  tone?: KpiTone
  isLoading?: boolean
  className?: string
}

/** Stat tile reutilizável: label + valor grande + hint opcional. */
export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  isLoading,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-card px-4 py-3.5",
        className
      )}
    >
      {icon ? (
        <span
          className={cn(
            "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
            TONE_ICON[tone]
          )}
        >
          <HugeiconsIcon icon={icon} strokeWidth={1.8} className="size-4.5" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1.5 h-7 w-24" />
        ) : (
          // Figuras proporcionais (sem tabular-nums): número grande isolado.
          <p className="mt-0.5 truncate text-2xl font-semibold tracking-tight">
            {value}
          </p>
        )}
        {hint && !isLoading ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Grade responsiva para uma fileira de KPIs. */
export function KpiGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  )
}
