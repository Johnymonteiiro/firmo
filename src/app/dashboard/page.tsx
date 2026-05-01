import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-base font-semibold">Dashboard</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-sidebar" />
          <div className="aspect-video rounded-xl bg-sidebar" />
          <div className="aspect-video rounded-xl bg-sidebar" />
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-sidebar md:min-h-min" />
      </div>
    </>
  )
}
