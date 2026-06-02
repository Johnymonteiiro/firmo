import { CommitmentsDataTable } from "@/components/commitments/commitments-data-table"
import { PageSection } from "@/components/page-section"

export default function Page() {
  return (
    <PageSection title="Empenhos">
      <CommitmentsDataTable />
    </PageSection>
  )
}
