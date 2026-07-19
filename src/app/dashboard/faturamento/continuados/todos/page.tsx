import { BillingsDataTable } from "@/components/billings/billings-data-table"
import { BillingsKpis } from "@/components/billings/billings-kpis"
import { PageSection } from "@/components/page-section"

export default function Page() {
  return (
    <PageSection title="Faturamentos">
      <BillingsKpis />
      <BillingsDataTable />
    </PageSection>
  )
}
