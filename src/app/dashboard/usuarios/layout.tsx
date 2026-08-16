import { ThemeToggle } from "@/components/theme-toggle"
import { SubNav, type SubNavItem } from "@/components/sub-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon } from "@hugeicons/core-free-icons"

const BASE = "/dashboard/usuarios"

const navItems: SubNavItem[] = [
  {
    title: "Usuários",
    icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.6} />,
    items: [
      { title: "Todos", url: `${BASE}/todos` },
      { title: "Arquivados", url: `${BASE}/arquivados` },
    ],
  },
]

export default function UsuariosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold tracking-tight">Usuários</h1>
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
