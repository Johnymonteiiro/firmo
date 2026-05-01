import { ThemeToggle } from "@/components/theme-toggle"
import { SubNav } from "@/components/sub-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckListIcon,
  MoneyReceive01Icon,
  Invoice02Icon,
  PieChart01Icon,
} from "@hugeicons/core-free-icons"

const navItems = [
  {
    title: "Relação de Contratos",
    url: "/dashboard/contratos/continuados/relacao-contratos",
    icon: <HugeiconsIcon icon={CheckListIcon} strokeWidth={2} />,
  },
  {
    title: "Empenhos e Saldos",
    url: "/dashboard/contratos/continuados/empenhos-saldos",
    icon: <HugeiconsIcon icon={MoneyReceive01Icon} strokeWidth={2} />,
  },
  {
    title: "Faturamento",
    url: "/dashboard/contratos/continuados/faturamento",
    icon: <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} />,
  },
  {
    title: "Gestão Orçamentária",
    url: "/dashboard/contratos/continuados/gestao-orcamentaria",
    icon: <HugeiconsIcon icon={PieChart01Icon} strokeWidth={2} />,
  },
]

export default function ContinuadosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-base font-semibold">Contratos Continuados</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 p-4 overflow-hidden">
        <div className="flex flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
          <SubNav items={navItems} />
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </div>
      </div>
    </>
  )
}
