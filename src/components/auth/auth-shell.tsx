import * as React from "react"
import Image from "next/image"

/**
 * Moldura das telas de autenticação: marca à esquerda, formulário à direita.
 *
 * Sem card em nenhum dos dois lados — numa tela que só tem uma coisa a fazer,
 * a moldura extra não separa nada de nada.
 */
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Marca — some no mobile, onde viraria só uma coluna vazia. */}
      <aside className="hidden flex-col items-center justify-center border-r bg-card px-10 lg:flex">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* O favicon é 96×132 (o brasão tem a palavra UFSC embaixo), não
              quadrado — declarar 1:1 distorceria e o next/image avisa. */}
          <Image src="/favicon.ico" alt="" width={128} height={176} priority />
          <div className="flex flex-col gap-3">
            <p className="text-6xl font-semibold tracking-tight">GFC</p>
            <p className="text-base uppercase tracking-[0.08em] text-muted-foreground">
              Gestão e Faturamento de Contratos
            </p>
          </div>
          <p className="max-w-sm text-base text-muted-foreground">
            Controle de contratos continuados, empenhos, saldos e faturamento —
            UFSC.
          </p>
        </div>
      </aside>

      {/* Formulário */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </main>
  )
}
