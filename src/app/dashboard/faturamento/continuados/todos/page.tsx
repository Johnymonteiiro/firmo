import { BillingsDataTable } from "@/components/billings/billings-data-table"
import { PageSection } from "@/components/page-section"

export default function Page() {
  return (
    <PageSection title="Faturamentos">
      <BillingsDataTable />
    </PageSection>
  )
}
