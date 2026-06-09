"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { DataGrid } from "@/components/reui/data-grid/data-grid"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  DataTableToolbar,
  type DataTableFilter,
} from "@/components/data-table/data-table-toolbar"

/** id resolvido de uma coluna (id explícito ou accessorKey). */
function columnId<TData>(col: ColumnDef<TData>): string | undefined {
  return col.id ?? (col as { accessorKey?: string }).accessorKey
}

export interface DataTableProps<TData extends object> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  getRowId?: (row: TData) => string
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  /** Conteúdo à direita da toolbar (ex.: botão "Novo"). */
  actions?: React.ReactNode
  emptyMessage?: string
  initialPageSize?: number
  /** Colunas redimensionáveis. Quando false, a tabela ocupa toda a largura (ideal p/ poucas colunas). */
  resizable?: boolean
  /** Clique na linha (ex.: abrir histórico). */
  onRowClick?: (row: TData) => void
  /** Fixa 1ª e última coluna (padrão true). */
  pinnedEnds?: boolean
}

export function DataTable<TData extends object>({
  columns,
  data,
  isLoading,
  getRowId,
  searchPlaceholder,
  filters,
  actions,
  emptyMessage = "Nenhum registro encontrado.",
  initialPageSize = 10,
  resizable = true,
  onRowClick,
  pinnedEnds = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const columnPinning = React.useMemo(() => {
    if (!pinnedEnds || columns.length === 0) return { left: [], right: [] }
    const left = columnId(columns[0])
    const right =
      columns.length > 1 ? columnId(columns[columns.length - 1]) : undefined
    return {
      left: left ? [left] : [],
      right: right ? [right] : [],
    }
  }, [columns, pinnedEnds])

  const table = useReactTable({
    data,
    columns,
    getRowId,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    enableColumnPinning: pinnedEnds,
    defaultColumn: { minSize: 60 },
    initialState: { columnPinning },
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <DataGrid
      table={table}
      recordCount={table.getFilteredRowModel().rows.length}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      onRowClick={onRowClick}
      tableLayout={{
        columnsResizable: resizable,
        columnsResizeMode: "onChange",
        columnsPinnable: pinnedEnds,
        width: resizable ? "fixed" : "auto",
        headerBorder: false,
      }}
      tableClassNames={{
        headerRow: "bg-muted [&>th]:h-10",
        bodyRow: "[&>td]:h-11.5",
      }}
    >
      <div className="flex min-w-0 flex-col gap-4">
        {/* toolbar separada do card (como na referência) */}
        <div className="flex items-center justify-between gap-2.5">
          <DataTableToolbar
            table={table}
            searchValue={globalFilter}
            onSearchChange={setGlobalFilter}
            searchPlaceholder={searchPlaceholder}
            filters={filters}
          />
          {actions ?? null}
        </div>

        <Card className="w-full min-w-0 gap-0 overflow-hidden border-0 py-0 shadow-md">
          <CardContent className="min-w-0 p-0">
            <div className="firmo-scroll w-full overflow-x-auto">
              <DataGridTable />
            </div>
          </CardContent>
          <CardFooter className="border-0 bg-muted px-3.5 py-2">
            <DataGridPagination
              rowsPerPageLabel="Linhas por página"
              info="{from}–{to} de {count}"
              previousPageLabel="Página anterior"
              nextPageLabel="Próxima página"
            />
          </CardFooter>
        </Card>
      </div>
    </DataGrid>
  )
}
