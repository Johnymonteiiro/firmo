import { SectionShell } from "@/components/section-shell"
import { type SubNavItem } from "@/components/sub-nav"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckListIcon,
  MoneyReceive01Icon,
} from "@hugeicons/core-free-icons"

const BASE = "/dashboard/contratos/continuados"

const estados = (prefix: string): SubNavItem[] => [
  { title: "Todos", url: `${prefix}/todos` },
  { title: "Arquivados", url: `${prefix}/arquivados` },
]

const navItems: SubNavItem[] = [
  {
    title: "Relação de Contratos",
    icon: <HugeiconsIcon icon={CheckListIcon} strokeWidth={1.6} />,
    items: estados(`${BASE}/relacao-contratos`),
  },
  {
    title: "Empenhos e Saldos",
    icon: <HugeiconsIcon icon={MoneyReceive01Icon} strokeWidth={1.6} />,
    items: [
      {
        title: "Empenhos",
        items: estados(`${BASE}/empenhos-saldos/empenhos`),
      },
      // "Reforços" saiu da navegação: criação passa a ser pela ação
      // "Adicionar Reforço" na linha do empenho, e o histórico é unificado.
    ],
  },
]

export default function ContinuadosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SectionShell title="Contratos Continuados" navItems={navItems}>
      {children}
    </SectionShell>
  )
}
