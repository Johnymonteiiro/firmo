import { ArchivedCommitmentsCards } from "@/components/commitments/archived-commitments-cards"
import { PageSection } from "@/components/page-section"

export default function Page() {
  return (
    <PageSection title="Empenhos Arquivados">
      <ArchivedCommitmentsCards />
    </PageSection>
  )
}
