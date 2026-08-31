import { CreditorsDataTable } from "@/components/non-continuous/creditors-data-table"
import { CreditorsKpis } from "@/components/non-continuous/creditors-kpis"
import { PageSection } from "@/components/page-section"

export default function Page() {
  return (
    <PageSection title="Empresas e Saldos">
      <CreditorsKpis />
      <CreditorsDataTable />
    </PageSection>
  )
}
