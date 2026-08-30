"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * `outline` é o padrão da casa: a mesma moldura de card usada nas abas
 * escritas à mão em `user-detail`. `line` é a régua sublinhada, para quando as
 * abas encabeçam a página inteira.
 */
const tabsListVariants = cva("inline-flex w-fit items-center", {
  variants: {
    variant: {
      outline: "gap-1 rounded-lg border bg-card p-1",
      line: "gap-4 border-b border-border",
    },
  },
  defaultVariants: { variant: "outline" },
})

const tabsTriggerVariants = cva(
  "inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        outline:
          "rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground",
        line: "-mb-px border-b-2 border-transparent px-1 pb-2.5 text-muted-foreground hover:text-foreground data-[state=active]:border-sidebar-primary data-[state=active]:text-foreground",
      },
    },
    defaultVariants: { variant: "outline" },
  }
)

type TabsVariant = VariantProps<typeof tabsListVariants>["variant"]

/** A lista escolhe a variante; os triggers herdam por contexto. */
const TabsVariantContext = React.createContext<TabsVariant>("outline")

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsVariantContext.Provider value={variant ?? "outline"}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  )
}

function TabsTrigger({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>) {
  const inherited = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        tabsTriggerVariants({ variant: variant ?? inherited }),
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
