"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
]

export interface MonthPickerProps {
  /** "yyyy-MM". */
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  "aria-invalid"?: boolean
}

/** Seletor de mês/ano (competência) — sem dias. */
export function MonthPicker({
  value,
  onChange,
  onBlur,
  placeholder = "Selecione o mês",
  "aria-invalid": ariaInvalid,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false)

  const match = value && /^\d{4}-\d{2}$/.test(value) ? value : undefined
  const selectedYear = match ? Number(match.slice(0, 4)) : undefined
  const selectedMonth = match ? Number(match.slice(5, 7)) : undefined // 1–12

  const [viewYear, setViewYear] = React.useState(
    selectedYear ?? new Date().getFullYear()
  )

  function handleOpenChange(next: boolean) {
    if (next) setViewYear(selectedYear ?? new Date().getFullYear())
    setOpen(next)
    if (!next) onBlur?.()
  }

  function pick(monthIndex: number) {
    const mm = String(monthIndex + 1).padStart(2, "0")
    onChange(`${viewYear}-${mm}`)
    setOpen(false)
  }

  const display = match ? `${match.slice(5, 7)}/${match.slice(0, 4)}` : null

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-between font-normal",
            !display && "text-muted-foreground"
          )}
        >
          {display ?? placeholder}
          <HugeiconsIcon
            icon={Calendar01Icon}
            strokeWidth={2}
            className="size-4 opacity-60"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewYear((y) => y - 1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
            <span className="sr-only">Ano anterior</span>
          </Button>
          <span className="text-sm font-medium tabular-nums">{viewYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewYear((y) => y + 1)}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            <span className="sr-only">Próximo ano</span>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {MONTHS.map((m, i) => {
            const active =
              selectedYear === viewYear && selectedMonth === i + 1
            return (
              <Button
                key={m}
                type="button"
                variant={active ? "default" : "ghost"}
                size="sm"
                className="font-normal"
                onClick={() => pick(i)}
              >
                {m}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
