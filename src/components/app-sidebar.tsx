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
} from "@hugeicons/core-free-icons"

export const sidebarUser = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
  },
  {
    title: "Contratos",
    url: "/dashboard/contratos",
    icon: <HugeiconsIcon icon={ContractsIcon} strokeWidth={2} />,
    items: [
      {
        title: "Continuados",
        url: "/dashboard/contratos/continuados",
        icon: <HugeiconsIcon icon={FileVerifiedIcon} strokeWidth={2} />,
      },
      {
        title: "Não Continuados",
        url: "/dashboard/contratos/nao-continuados",
        icon: <HugeiconsIcon icon={FileValidationIcon} strokeWidth={2} />,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <HugeiconsIcon icon={CommandIcon} strokeWidth={2} className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Firmo</span>
                  <span className="truncate text-xs">UFSC</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
