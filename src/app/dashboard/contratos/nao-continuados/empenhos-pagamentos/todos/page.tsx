import { Suspense } from "react"

import { MovementsDataTable } from "@/components/non-continuous/movements-data-table"
import { MovementsKpis } from "@/components/non-continuous/movements-kpis"
import { PageSection } from "@/components/page-section"

export default function Page() {
  return (
    <PageSection title="Empenhos e Pagamentos">
      <MovementsKpis />
      {/* A tabela lê `?creditorId=` — useSearchParams exige Suspense no App Router. */}
      <Suspense fallback={null}>
        <MovementsDataTable />
      </Suspense>
    </PageSection>
  )
}
