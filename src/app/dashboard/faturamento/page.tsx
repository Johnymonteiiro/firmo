import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold tracking-tight">Faturamento</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 p-4 overflow-hidden">
        <div className="flex flex-1 overflow-hidden rounded-xl border bg-card shadow-sm" />
      </div>
    </>
  )
}
