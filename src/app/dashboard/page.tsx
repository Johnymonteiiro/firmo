import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"

type Stat = {
  k: string
  v: string
  d: string
  trend: "up" | "down"
}

const stats: Stat[] = [
  { k: "Contratos vigentes", v: "37", d: "+4 no mês", trend: "up" },
  { k: "Valor global ativo", v: "R$ 812,1 mi", d: "+2,3%", trend: "up" },
  { k: "A vencer em 60 dias", v: "6", d: "atenção", trend: "down" },
  { k: "Empenhos abertos", v: "128", d: "−9", trend: "down" },
]

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-md">
      <div className="text-xs font-medium text-muted-foreground">{stat.k}</div>
      <div className="mt-1.5 font-mono text-2xl font-light tracking-tight tabular-nums text-foreground">
        {stat.v}
      </div>
      <div
        className={cn(
          "mt-2 flex items-center gap-1 text-xs",
          stat.trend === "up" ? "text-success" : "text-destructive"
        )}
      >
        <HugeiconsIcon
          icon={stat.trend === "up" ? ArrowUp01Icon : ArrowDown01Icon}
          strokeWidth={2.2}
          className="size-3.5"
        />
        {stat.d}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold tracking-tight">Painel geral</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.k} stat={s} />
          ))}
        </div>
      </div>
    </>
  )
}
