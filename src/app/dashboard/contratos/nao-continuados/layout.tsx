import { ThemeToggle } from "@/components/theme-toggle"
import { SubNav } from "@/components/sub-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Payment01Icon,
  Building04Icon,
} from "@hugeicons/core-free-icons"

const navItems = [
  {
    title: "Empenhos e Pagamentos",
    url: "/dashboard/contratos/nao-continuados/empenhos-pagamentos",
    icon: <HugeiconsIcon icon={Payment01Icon} strokeWidth={1.6} />,
  },
  {
    title: "Empresas e Saldos",
    url: "/dashboard/contratos/nao-continuados/empresas-saldos",
    icon: <HugeiconsIcon icon={Building04Icon} strokeWidth={1.6} />,
  },
]

export default function NaoContinuadosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold tracking-tight">
          Contratos Não Continuados
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
