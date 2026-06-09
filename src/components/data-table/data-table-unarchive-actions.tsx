"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApiError } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalCircle01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons"

export interface DataTableUnarchiveActionsProps {
  entityLabel: string
  onUnarchive: () => Promise<unknown>
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Ação de linha para itens arquivados: Desarquivar. */
export function DataTableUnarchiveActions({
  entityLabel,
  onUnarchive,
}: DataTableUnarchiveActionsProps) {
  const [pending, setPending] = React.useState(false)

  function handleUnarchive() {
    setPending(true)
    Promise.resolve(onUnarchive())
      .then(() => toast.success(`${capitalize(entityLabel)} desarquivado.`))
      .catch((err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `Não foi possível desarquivar o ${entityLabel}.`
        )
      )
      .finally(() => setPending(false))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" size="icon" variant="ghost">
          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
          <span className="sr-only">Ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem onClick={handleUnarchive} disabled={pending}>
          <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
          Desarquivar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
