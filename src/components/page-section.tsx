"use client"

import * as React from "react"

import { useSectionTitle } from "@/components/section-shell"

/**
 * Título da página + conteúdo (padrão das telas de listagem).
 *
 * O título some quando repete o nome da seção que já está no header — em
 * "Usuários → Usuários" a segunda linha não acrescenta nada. Sem `title`, a
 * página é só o conteúdo, para quando a subnavegação já nomeia a tela.
 */
export function PageSection({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  const sectionTitle = useSectionTitle()
  const echoesSection =
    !!title && !!sectionTitle && normalize(title) === normalize(sectionTitle)

  return (
    <div className="flex flex-col gap-4">
      {title && !echoesSection ? (
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      ) : null}
      {children}
    </div>
  )
}

const normalize = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
