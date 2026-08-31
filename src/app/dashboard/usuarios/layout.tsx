import { SectionShell } from "@/components/section-shell"
import { type SubNavItem } from "@/components/sub-nav"
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
    <SectionShell title="Usuários" navItems={navItems}>
      {children}
    </SectionShell>
  )
}
