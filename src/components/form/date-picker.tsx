"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon } from "@hugeicons/core-free-icons"

export interface DatePickerProps {
  /** "yyyy-MM-dd" (day) ou "yyyy-MM" (month). */
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  granularity?: "day" | "month"
  "aria-invalid"?: boolean
}

/** Date picker (shadcn): botão estilo input + Calendar em popover. */
export function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder,
  granularity = "day",
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const storeFmt = granularity === "month" ? "yyyy-MM" : "yyyy-MM-dd"
  const displayFmt = granularity === "month" ? "MM/yyyy" : "dd/MM/yyyy"

  const parsed = value ? parse(value, storeFmt, new Date()) : undefined
  const date = parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) onBlur?.()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-between font-normal",
            !date && "text-muted-foreground"
          )}
        >
          {date
            ? format(date, displayFmt, { locale: ptBR })
            : (placeholder ??
              (granularity === "month" ? "Selecione o mês" : "Selecione a data"))}
          <HugeiconsIcon
            icon={Calendar01Icon}
            strokeWidth={2}
            className="size-4 opacity-60"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          locale={ptBR}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, storeFmt))
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
