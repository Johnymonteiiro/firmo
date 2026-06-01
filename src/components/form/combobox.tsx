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
  ArrowDown01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  "aria-invalid"?: boolean
  onBlur?: () => void
}

/** Combobox leve com busca (Popover + input + lista filtrável). */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado.",
  disabled,
  "aria-invalid": ariaInvalid,
  onBlur,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const selected = options.find((o) => o.value === value)
  const filtered = query
    ? options.filter((o) =>
        `${o.label} ${o.description ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : options

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setQuery("")
      onBlur?.()
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="size-4 shrink-0 opacity-60"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="size-4 shrink-0 text-muted-foreground"
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  handleOpenChange(false)
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                  option.value === value && "bg-accent"
                )}
              >
                <span className="flex-1">
                  <span className="block">{option.label}</span>
                  {option.description && (
                    <span className="block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
                {option.value === value && (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    strokeWidth={2}
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
