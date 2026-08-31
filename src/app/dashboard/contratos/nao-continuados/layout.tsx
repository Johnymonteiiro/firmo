import { SectionShell } from "@/components/section-shell"
import { type SubNavItem } from "@/components/sub-nav"
import { HugeiconsIcon } from "@hugeicons/react"
import { Payment01Icon, Building04Icon } from "@hugeicons/core-free-icons"

const BASE = "/dashboard/contratos/nao-continuados"

const estados = (prefix: string): SubNavItem[] => [
  { title: "Todos", url: `${prefix}/todos` },
  { title: "Arquivados", url: `${prefix}/arquivados` },
]

const navItems: SubNavItem[] = [
  {
    title: "Empresas e Saldos",
    icon: <HugeiconsIcon icon={Building04Icon} strokeWidth={1.6} />,
    items: estados(`${BASE}/empresas-saldos`),
  },
  {
    title: "Empenhos e Pagamentos",
    icon: <HugeiconsIcon icon={Payment01Icon} strokeWidth={1.6} />,
    items: estados(`${BASE}/empenhos-pagamentos`),
  },
]

export default function NaoContinuadosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SectionShell title="Contratos Não Continuados" navItems={navItems}>
      {children}
    </SectionShell>
  )
}
