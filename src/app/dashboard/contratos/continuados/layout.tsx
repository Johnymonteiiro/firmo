import { ThemeToggle } from "@/components/theme-toggle"
import { SubNav, type SubNavItem } from "@/components/sub-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
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
      {
        title: "Reforços",
        items: estados(`${BASE}/empenhos-saldos/reforcos`),
      },
    ],
  },
]

export default function ContinuadosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold tracking-tight">
          Contratos Continuados
        </h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 min-w-0 overflow-hidden">
        <SubNav items={navItems} />
        <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto px-6 pb-7 pt-2">
          {children}
        </div>
      </div>
    </>
  )
}
