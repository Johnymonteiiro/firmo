import * as React from "react"

/** Título da página + conteúdo (padrão das telas de listagem). */
export function PageSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {children}
    </div>
  )
}
