"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SubNavItem {
  title: string
  url: string
  icon: React.ReactNode
}

export function SubNav({ items }: { items: SubNavItem[] }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r flex flex-col gap-1 px-3 py-4 bg-sidebar rounded-l-xl">
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.url}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
            pathname === item.url
              ? "bg-sidebar-primary text-white font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      ))}
    </aside>
  )
}
