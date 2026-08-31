import { SectionShell } from "@/components/section-shell"
import { type SubNavItem } from "@/components/sub-nav"
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
    <SectionShell title="Configurações" navItems={navItems}>
      {children}
    </SectionShell>
  )
}
