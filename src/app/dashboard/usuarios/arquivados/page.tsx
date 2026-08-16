import { PageSection } from "@/components/page-section"
import { ArchivedUsersCards } from "@/components/users/archived-users-cards"

export default function Page() {
  return (
    <PageSection title="Usuários arquivados">
      <ArchivedUsersCards />
    </PageSection>
  )
}
