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
    icon: <HugeiconsIcon icon={Payment01Icon} strokeWidth={2} />,
  },
  {
    title: "Empresas e Saldos",
    url: "/dashboard/contratos/nao-continuados/empresas-saldos",
    icon: <HugeiconsIcon icon={Building04Icon} strokeWidth={2} />,
  },
]

export default function NaoContinuadosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-base font-semibold">Contratos Não Continuados</h1>
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
