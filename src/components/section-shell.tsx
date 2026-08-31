"use client"

import * as React from "react"

import { AppHeader } from "@/components/app-header"
import { SubNav, type SubNavItem } from "@/components/sub-nav"

/** Nome da seção corrente, para quem estiver abaixo não repeti-lo. */
const SectionTitleContext = React.createContext<string | null>(null)

export function useSectionTitle(): string | null {
  return React.useContext(SectionTitleContext)
}

/**
 * Casca de uma seção: header + subnavegação + área de conteúdo rolável.
 *
 * `title` é o nome da seção, e tanto a subnavegação quanto o título da página
 * sabem disso — o que se chamaria igual não repete o nome. Sem isso a pessoa
 * lia "Configurações → Configurações → Permissões".
 */
export function SectionShell({
  title,
  navItems,
  children,
}: {
  title: string
  /** Ausente numa seção de tela única (painel, gestão orçamentária). */
  navItems?: SubNavItem[]
  children: React.ReactNode
}) {
  const content = (
    <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-6 pt-2 pb-7">
      {children}
    </div>
  )

  return (
    <SectionTitleContext.Provider value={title}>
      <AppHeader title={title} />
      {navItems?.length ? (
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <SubNav items={navItems} sectionTitle={title} />
          {content}
        </div>
      ) : (
        content
      )}
    </SectionTitleContext.Provider>
  )
}
