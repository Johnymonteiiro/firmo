"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

export interface SubNavItem {
  title: string
  /** Link da folha. Itens com `items` são grupos. */
  url?: string
  icon?: React.ReactNode
  items?: SubNavItem[]
}

const idleClass =
  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
const activeClass =
  "bg-sidebar-primary/15 text-sidebar-accent-foreground font-medium before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.75 before:-translate-y-1/2 before:rounded-r-full before:bg-sidebar-primary"

function Leaf({ item, deep }: { item: SubNavItem; deep?: boolean }) {
  const pathname = usePathname()
  const active = item.url ? pathname === item.url : false
  return (
    <Link
      href={item.url ?? "#"}
      className={cn(
        "relative flex items-center rounded-md py-2 pr-3 text-sm transition-colors",
        deep ? "pl-12" : "pl-9",
        active ? activeClass : idleClass
      )}
    >
      {item.title}
    </Link>
  )
}

function Subhead({ title }: { title: string }) {
  return (
    <div className="px-3 pt-3 pb-1 pl-9 text-2xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">
      {title}
    </div>
  )
}

/** Grupo de topo (único nível colapsável). */
function Group({ item }: { item: SubNavItem }) {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent [&_svg]:size-4 [&_svg]:shrink-0">
        {item.icon}
        <span className="flex-1 text-left">{item.title}</span>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          strokeWidth={1.6}
          className="size-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-0.5 flex flex-col gap-0.5">
        {item.items?.map((child) =>
          child.items?.length ? (
            <React.Fragment key={child.title}>
              <Subhead title={child.title} />
              {child.items.map((leaf) => (
                <Leaf key={leaf.title} item={leaf} deep />
              ))}
            </React.Fragment>
          ) : (
            <Leaf key={child.title} item={child} />
          )
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SubNav({ items }: { items: SubNavItem[] }) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 overflow-y-auto bg-(--subnav) px-3 py-4">
      {items.map((item) => (
        <Group key={item.title} item={item} />
      ))}
    </aside>
  )
}
