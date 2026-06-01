import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-2 text-sm font-medium text-muted-foreground">
      {children}
    </p>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

/** Label + controle (children) + mensagem de erro. */
export function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  )
}
