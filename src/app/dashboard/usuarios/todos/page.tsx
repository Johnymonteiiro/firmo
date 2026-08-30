import { PageSection } from "@/components/page-section"
import { UsersDataTable } from "@/components/users/users-data-table"
import { UsersKpis } from "@/components/users/users-kpis"

export default function Page() {
  return (
    <PageSection title="Usuários">
      <UsersKpis />
      <UsersDataTable />
    </PageSection>
  )
}
