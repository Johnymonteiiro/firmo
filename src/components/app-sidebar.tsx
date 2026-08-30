"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  PERMISSIONS,
  usePermissions,
  type Can,
  type PermissionKey,
} from "@/lib/permissions"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CommandIcon,
  DashboardSquare01Icon,
  ContractsIcon,
  FileVerifiedIcon,
  FileValidationIcon,
  Invoice02Icon,
  PieChart01Icon,
  Settings02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

/**
 * Item de navegação. `permission` é a chave que libera o destino — sem ela o
 * item some da barra, em vez de levar a uma tela que responderia 403. Item
 * sem `permission` é visível para qualquer sessão.
 */
interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  permission?: PermissionKey
  items?: NavItem[]
}

const navGeral: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={1.6} />,
  },
]

const navGestao: NavItem[] = [
  {
    title: "Contratos",
    url: "/dashboard/contratos",
    icon: <HugeiconsIcon icon={ContractsIcon} strokeWidth={1.6} />,
    permission: PERMISSIONS.contratosVisualizar,
    items: [
      {
        title: "Continuados",
        url: "/dashboard/contratos/continuados",
        icon: <HugeiconsIcon icon={FileVerifiedIcon} strokeWidth={1.6} />,
      },
      {
        title: "Não Continuados",
        url: "/dashboard/contratos/nao-continuados",
        icon: <HugeiconsIcon icon={FileValidationIcon} strokeWidth={1.6} />,
      },
    ],
  },
  {
    title: "Faturamento",
    url: "/dashboard/faturamento",
    icon: <HugeiconsIcon icon={Invoice02Icon} strokeWidth={1.6} />,
    permission: PERMISSIONS.faturamentosVisualizar,
  },
  {
    title: "Gestão Orçamentária",
    url: "/dashboard/gestao-orcamentaria",
    icon: <HugeiconsIcon icon={PieChart01Icon} strokeWidth={1.6} />,
    permission: PERMISSIONS.empenhosVisualizar,
  },
]

// Separado de "Gestão": usuários não são domínio de contrato.
const navAdministracao: NavItem[] = [
  {
    title: "Usuários",
    url: "/dashboard/usuarios",
    icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.6} />,
    permission: PERMISSIONS.usuariosVisualizar,
  },
  // Como Usuários: item único na barra lateral — as categorias da RN-C04
  // aparecem na subnavbar da própria seção.
  {
    title: "Configurações",
    url: "/dashboard/configuracoes",
    icon: <HugeiconsIcon icon={Settings02Icon} strokeWidth={1.6} />,
    permission: PERMISSIONS.configuracoesVisualizar,
  },
]

/** Poda a árvore de navegação com o que a sessão pode acessar. */
function visibleItems(items: NavItem[], can: Can): NavItem[] {
  return items
    .filter((item) => !item.permission || can(item.permission))
    .map((item) =>
      item.items ? { ...item, items: visibleItems(item.items, can) } : item
    )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { can } = usePermissions()

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-[150deg] from-sidebar-primary to-[oklch(0.5_0.085_256)] text-sidebar-primary-foreground shadow-sm">
                  <HugeiconsIcon icon={CommandIcon} strokeWidth={1.6} className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-md font-semibold tracking-tight">GFC</span>
                  <span className="truncate text-2xs uppercase tracking-[0.04em] text-muted-foreground">Gestão e Faturamento de Contratos</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Geral" items={visibleItems(navGeral, can)} />
        <NavMain label="Gestão" items={visibleItems(navGestao, can)} />
        <NavMain
          label="Administração"
          items={visibleItems(navAdministracao, can)}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
