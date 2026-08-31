import { BudgetOverview } from "@/components/budget/budget-overview"
import { SectionShell } from "@/components/section-shell"

export default function Page() {
  return (
    <SectionShell title="Gestão Orçamentária">
      <BudgetOverview />
    </SectionShell>
  )
}
