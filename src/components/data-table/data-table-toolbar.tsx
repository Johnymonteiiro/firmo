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
  FilterResetIcon,
  MultiplicationSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

export interface DataTableFilter {
  /** id da coluna a filtrar (precisa de filterFn que aceite array). */
  columnId: string
  title: string
  /**
   * Ordem fixa das opções, quando o domínio tem uma que não é a alfabética
   * ("Até 30 dias" antes de "31–60 dias"). Valor fora desta lista continua
   * aparecendo, no fim. Sem ela, ordena alfabeticamente.
   */
  order?: string[]
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
  // A instância da tabela é um objeto mutável: o compilador do React não vê
  // as leituras feitas nela e, como `column` mantém a mesma identidade entre
  // renders, memoizava este subtree para sempre. Na prática o filtro lia as
  // facetas uma única vez — durante o carregamento, com a tabela vazia — e
  // nunca mais, então o popover abria sem nenhuma opção.
  "use no memo"

  const activeFilters = table.getState().columnFilters.length
  const hasFilters = activeFilters > 0 || searchValue.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2.5">
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
            order={filter.order}
          />
        )
      })}

      {hasFilters ? (
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => {
            table.resetColumnFilters()
            onSearchChange("")
          }}
        >
          <HugeiconsIcon icon={FilterResetIcon} strokeWidth={2} />
          Limpar
        </Button>
      ) : null}
    </div>
  )
}

function FacetedFilter<TData>({
  column,
  title,
  order,
}: {
  column: Column<TData, unknown>
  title: string
  order?: string[]
}) {
  // Mesmo motivo do componente acima: as facetas são lidas da tabela a cada
  // render, e memoizar por `column` congelaria a lista.
  "use no memo"

  const facets = column.getFacetedUniqueValues()
  const selected = new Set((column.getFilterValue() as string[]) ?? [])
  const options = sortOptions(
    Array.from(facets.keys()).filter(
      (value): value is string => typeof value === "string" && !!value
    ),
    order
  )

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
          {/* Nomear o filtro: com dois ou mais na mesma toolbar, "Filtro"
              repetido não diz qual é qual. */}
          {title}
          {selected.size > 0 && (
            <Badge variant="secondary">{selected.size}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {title}
            </span>
            {selected.size > 0 ? (
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                onClick={() => column.setFilterValue(undefined)}
              >
                Limpar
              </button>
            ) : null}
          </div>

          {options.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nada para filtrar nesta coluna.
            </p>
          ) : (
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {options.map((option) => (
                <div key={option} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`${title}-${option}`}
                    checked={selected.has(option)}
                    onCheckedChange={(checked) =>
                      toggle(option, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`${title}-${option}`}
                    className="flex grow items-center justify-between gap-1.5 font-normal"
                  >
                    <span className="min-w-0 truncate" title={option}>
                      {option}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {facets.get(option)}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Ordem declarada primeiro (na ordem dada); o resto, alfabético. */
function sortOptions(values: string[], order?: string[]): string[] {
  if (!order?.length) return values.sort((a, b) => a.localeCompare(b, "pt-BR"))

  const rank = new Map(order.map((value, index) => [value, index]))
  return values.sort((a, b) => {
    const rankA = rank.get(a) ?? Number.MAX_SAFE_INTEGER
    const rankB = rank.get(b) ?? Number.MAX_SAFE_INTEGER
    return rankA === rankB ? a.localeCompare(b, "pt-BR") : rankA - rankB
  })
}
