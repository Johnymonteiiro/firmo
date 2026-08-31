import { PermissionsScreen } from "@/components/config/permissions-screen"
import { PageSection } from "@/components/page-section"

export default function Page() {
  // Sem título: a subnavegação ao lado já marca "Permissões".
  return (
    <PageSection>
      <PermissionsScreen />
    </PageSection>
  )
}
