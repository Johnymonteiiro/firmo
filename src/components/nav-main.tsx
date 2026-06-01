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
  SidebarGroupLabel,
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
  label,
}: {
  label?: string
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
      {label ? (
        <SidebarGroupLabel className="text-2xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">
          {label}
        </SidebarGroupLabel>
      ) : null}
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
                        size="default"
                        isActive={isParentActive}
                        className="group-data-[collapsible=icon]:justify-center [&_svg]:size-4.5 relative data-active:bg-sidebar-primary/15 data-active:text-sidebar-accent-foreground data-active:font-medium data-active:hover:bg-sidebar-primary/15 data-active:before:absolute data-active:before:left-0 data-active:before:top-1/2 data-active:before:h-4 data-active:before:w-0.75 data-active:before:-translate-y-1/2 data-active:before:rounded-r-full data-active:before:bg-sidebar-primary"
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
                  <SidebarMenuSub className="border-l-0 px-0">

                    {item.items!.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.url}
                          className="data-active:bg-transparent data-active:text-sidebar-primary data-active:font-medium data-active:hover:bg-transparent data-active:hover:opacity-80"
                        >
                          <Link href={subItem.url}>
                            <span className="ml-1 size-1.5 shrink-0 rounded-full bg-current opacity-60 data-active:opacity-100" />
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
                size="default"
                isActive={pathname === item.url}
                className="group-data-[collapsible=icon]:justify-center [&_svg]:size-4.5 relative data-active:bg-sidebar-primary/15 data-active:text-sidebar-accent-foreground data-active:font-medium data-active:hover:bg-sidebar-primary/15 data-active:before:absolute data-active:before:left-0 data-active:before:top-1/2 data-active:before:h-4 data-active:before:w-0.75 data-active:before:-translate-y-1/2 data-active:before:rounded-r-full data-active:before:bg-sidebar-primary"
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
