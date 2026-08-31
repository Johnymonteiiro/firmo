"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalCircle01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons"

export interface DataTableUnarchiveActionsProps {
  onUnarchive: () => Promise<unknown>
}

/** Ação de linha para itens arquivados: Desarquivar. */
export function DataTableUnarchiveActions({
  onUnarchive,
}: DataTableUnarchiveActionsProps) {
  const [pending, setPending] = React.useState(false)

  // O aviso vem do hook de mutação; aqui só o estado do item do menu.
  function handleUnarchive() {
    setPending(true)
    Promise.resolve(onUnarchive())
      .catch(() => {})
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
