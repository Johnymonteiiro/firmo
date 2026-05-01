"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon: React.ReactNode
    }[]
  }[]
}) {
  const { state, isMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = !!item.items?.length
          const isParentActive = hasChildren
            ? item.items!.some((sub) => pathname === sub.url)
            : pathname === item.url

          return hasChildren ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isParentActive || item.isActive || true}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        isActive={isParentActive}
                        className="group-data-[collapsible=icon]:justify-center [&_svg]:size-5 data-active:bg-sidebar-primary data-active:text-white data-active:hover:bg-sidebar-primary data-active:hover:opacity-80"
                      >
                        {item.icon}
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          strokeWidth={2}
                          className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden"
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="center"
                    hidden={state !== "collapsed" || isMobile}
                  >
                    {item.title}
                  </TooltipContent>
                </Tooltip>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items!.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.url}
                          className="data-active:bg-transparent data-active:text-sidebar-primary data-active:font-medium data-active:hover:bg-transparent data-active:hover:opacity-80"
                        >
                          <Link href={subItem.url}>
                            {subItem.icon}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                size="lg"
                isActive={pathname === item.url}
                className="group-data-[collapsible=icon]:justify-center [&_svg]:size-5 data-active:bg-sidebar-primary data-active:text-white data-active:hover:bg-sidebar-primary data-active:hover:opacity-80"
              >
                <Link href={item.url}>
                  {item.icon}
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
