"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

/**
 * Conteúdo do botão enquanto a operação está no ar — o mesmo do login, para o
 * sistema inteiro dizer "estou trabalhando" da mesma forma.
 *
 * O ícone gira e o texto muda: só o texto some quando alguém lê rápido demais,
 * e só o ícone não diz o que está acontecendo.
 */
export function PendingLabel({
  pending,
  pendingLabel,
  children,
}: {
  pending?: boolean
  /** Ex.: "Salvando…", "Arquivando…". */
  pendingLabel: string
  children: React.ReactNode
}) {
  if (!pending) return <>{children}</>

  return (
    <>
      <HugeiconsIcon
        icon={Loading03Icon}
        strokeWidth={2}
        className="animate-spin"
      />
      {pendingLabel}
    </>
  )
}
