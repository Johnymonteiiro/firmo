import type { ColumnDef } from "@tanstack/react-table"

/** Coluna de ações padronizada (label "Ações"; fixa à direita via DataTable). */
export function actionsColumn<TData>(
  cell: ColumnDef<TData>["cell"]
): ColumnDef<TData> {
  return {
    id: "actions",
    header: "Ações",
    cell,
    size: 90,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  }
}
