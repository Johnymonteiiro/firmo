import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider
        style={{ "--sidebar-width": "15rem" } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset className="min-w-0">{children}</SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
