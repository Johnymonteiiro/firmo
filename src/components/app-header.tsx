import * as React from "react"

import { NotificationsBell } from "@/components/notifications-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

/**
 * Barra do topo, igual em toda seção: recolher a barra lateral, o nome da
 * seção, e à direita o que é da sessão e não da tela (avisos e tema).
 *
 * Existia copiada em cada layout, e as cópias já divergiam — é o lugar natural
 * para o que vale para o sistema inteiro.
 */
export function AppHeader({
  title,
  actions,
}: {
  title: string
  /** Ações da seção, à esquerda dos itens fixos. */
  actions?: React.ReactNode
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-6">
      <SidebarTrigger className="-ml-1" />
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-1">
        {actions}
        <NotificationsBell />
        <ThemeToggle />
      </div>
    </header>
  )
}
