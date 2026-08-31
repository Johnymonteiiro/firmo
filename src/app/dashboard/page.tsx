import { DashboardView } from "@/components/dashboard/dashboard-view"
import { SectionShell } from "@/components/section-shell"

export default function Page() {
  return (
    <SectionShell title="Painel geral">
      <DashboardView />
    </SectionShell>
  )
}
