import { ArchivedBillingsCards } from "@/components/billings/archived-billings-cards"
import { PageSection } from "@/components/page-section"

export default function Page() {
  return (
    <PageSection title="Faturamentos Arquivados">
      <ArchivedBillingsCards />
    </PageSection>
  )
}
