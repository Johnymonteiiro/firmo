import { ContractsDataTable } from "@/components/contracts/contracts-data-table"
import { ContractsKpis } from "@/components/contracts/contracts-kpis"
import { PageSection } from "@/components/page-section"

export default function Page() {
  return (
    <PageSection title="Contratos">
      <ContractsKpis />
      <ContractsDataTable />
    </PageSection>
  )
}
