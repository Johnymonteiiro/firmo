import { SectionShell } from "@/components/section-shell"
import { type SubNavItem } from "@/components/sub-nav"
import { HugeiconsIcon } from "@hugeicons/react"
import { Invoice02Icon } from "@hugeicons/core-free-icons"

const BASE = "/dashboard/faturamento/continuados"

const navItems: SubNavItem[] = [
  {
    title: "Contratos Continuados",
    icon: <HugeiconsIcon icon={Invoice02Icon} strokeWidth={1.6} />,
    items: [
      { title: "Todos", url: `${BASE}/todos` },
      { title: "Arquivados", url: `${BASE}/arquivados` },
    ],
  },
]

export default function FaturamentoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SectionShell title="Faturamento" navItems={navItems}>
      {children}
    </SectionShell>
  )
}
