"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalCircle01Icon,
  PencilEdit02Icon,
  Archive02Icon,
} from "@hugeicons/core-free-icons"

export interface DataTableRowActionsProps {
  onEdit?: () => void
  onArchive?: () => void
}

/** Coluna de ações reutilizável: Editar e Arquivar. */
export function DataTableRowActions({
  onEdit,
  onArchive,
}: DataTableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" size="icon" variant="ghost">
          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
          <span className="sr-only">Ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem onClick={onEdit}>
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onArchive}>
          <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
          Arquivar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
