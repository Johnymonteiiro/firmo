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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CommandIcon,
  DashboardSquare01Icon,
  ContractsIcon,
  FileVerifiedIcon,
  FileValidationIcon,
  Invoice02Icon,
  PieChart01Icon,
} from "@hugeicons/core-free-icons"

export const sidebarUser = {
  name: "Núcleo Gestor",
  email: "gestor@ufsc.br",
  avatar: "/avatars/gestor.jpg",
}

const navGeral = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={1.6} />,
  },
]

const navGestao = [
  {
    title: "Contratos",
    url: "/dashboard/contratos",
    icon: <HugeiconsIcon icon={ContractsIcon} strokeWidth={1.6} />,
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
  },
  {
    title: "Gestão Orçamentária",
    url: "/dashboard/gestao-orcamentaria",
    icon: <HugeiconsIcon icon={PieChart01Icon} strokeWidth={1.6} />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  <span className="truncate text-md font-semibold tracking-tight">Firmo</span>
                  <span className="truncate text-2xs uppercase tracking-[0.04em] text-muted-foreground">UFSC</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Geral" items={navGeral} />
        <NavMain label="Gestão" items={navGestao} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
