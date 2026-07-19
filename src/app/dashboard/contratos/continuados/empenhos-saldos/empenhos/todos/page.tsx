import { CommitmentsDataTable } from "@/components/commitments/commitments-data-table"
import { CommitmentsKpis } from "@/components/commitments/commitments-kpis"
import { PageSection } from "@/components/page-section"

export default function Page() {
  return (
    <PageSection title="Empenhos">
      <CommitmentsKpis />
      <CommitmentsDataTable />
    </PageSection>
  )
}
