"use client"

import type { Column, Table } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FilterIcon,
  MultiplicationSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

export interface DataTableFilter {
  /** id da coluna a filtrar (precisa de filterFn que aceite array). */
  columnId: string
  title: string
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: DataTableFilter[]
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center gap-2.5">
      <InputGroup className="h-10 w-80 rounded-lg border-transparent bg-card shadow-none">
        <InputGroupAddon align="inline-start">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchValue.length > 0 && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Limpar busca"
              title="Limpar busca"
              size="icon-xs"
              onClick={() => onSearchChange("")}
            >
              <HugeiconsIcon icon={MultiplicationSignIcon} strokeWidth={2} />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      {filters?.map((filter) => {
        const column = table.getColumn(filter.columnId)
        if (!column) return null
        return (
          <FacetedFilter
            key={filter.columnId}
            column={column}
            title={filter.title}
          />
        )
      })}
    </div>
  )
}

function FacetedFilter<TData>({
  column,
  title,
}: {
  column: Column<TData, unknown>
  title: string
}) {
  const facets = column.getFacetedUniqueValues()
  const selected = new Set((column.getFilterValue() as string[]) ?? [])
  const options = Array.from(facets.keys())
    .filter((value): value is string => typeof value === "string" && !!value)
    .sort()

  function toggle(value: string, checked: boolean) {
    const next = new Set(selected)
    if (checked) next.add(value)
    else next.delete(value)
    const arr = Array.from(next)
    column.setFilterValue(arr.length ? arr : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-lg border-transparent bg-card shadow-none hover:bg-secondary"
        >
          <HugeiconsIcon icon={FilterIcon} strokeWidth={2} />
          Filtro
          {selected.size > 0 && (
            <Badge variant="secondary">{selected.size}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start">
        <div className="space-y-3">
          <div className="text-muted-foreground text-xs font-medium">
            {title}
          </div>
          <div className="space-y-3">
            {options.map((option) => (
              <div key={option} className="flex items-center gap-2.5">
                <Checkbox
                  id={`${title}-${option}`}
                  checked={selected.has(option)}
                  onCheckedChange={(checked) => toggle(option, checked === true)}
                />
                <Label
                  htmlFor={`${title}-${option}`}
                  className="flex grow items-center justify-between gap-1.5 font-normal"
                >
                  {option}
                  <span className="text-muted-foreground">
                    {facets.get(option)}
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
