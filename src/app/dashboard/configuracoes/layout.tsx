import { ThemeToggle } from "@/components/theme-toggle"
import { SubNav, type SubNavItem } from "@/components/sub-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon } from "@hugeicons/core-free-icons"

const BASE = "/dashboard/configuracoes"

// As demais categorias da RN-C04 — parâmetros gerais (RF-C07) e notificações
// (RF-C08) — entram como novas folhas deste mesmo grupo.
const navItems: SubNavItem[] = [
  {
    title: "Configurações",
    icon: <HugeiconsIcon icon={Settings02Icon} strokeWidth={1.6} />,
    items: [{ title: "Permissões", url: `${BASE}/permissoes` }],
  },
]

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold tracking-tight">Configurações</h1>
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
