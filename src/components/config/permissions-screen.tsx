"use client"

import * as React from "react"

import { MatrixTab } from "@/components/config/matrix-tab"
import { ProfilesTab } from "@/components/config/profiles-tab"
import { UserLinksTab } from "@/components/config/user-links-tab"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { usePermissionCatalog, useProfiles } from "@/lib/config"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SecurityCheckIcon,
  UserGroupIcon,
  UserSettings01Icon,
} from "@hugeicons/core-free-icons"

type Tab = "perfis" | "matriz" | "vinculos"

/**
 * Configurações → Permissões (RN-C04), em três abas: os perfis (RF-C02), a
 * matriz de cada um (RF-C03) e os vínculos com usuários (RF-C04/C05).
 *
 * A tela não decide nada sobre acesso: mostra o catálogo do banco e devolve o
 * estado final dos toggles. Quem valida — inclusive a RN-C06, que impede
 * reduzir o Administrador — é o backend.
 */
export function PermissionsScreen() {
  const catalog = usePermissionCatalog()
  const profilesQuery = useProfiles()

  const [tab, setTab] = React.useState<Tab>("perfis")
  /** Perfil aberto na matriz — o atalho da aba Perfis escreve aqui. */
  const [profileId, setProfileId] = React.useState<string | null>(null)

  if (catalog.isLoading || profilesQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (catalog.isError || profilesQuery.isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar as configurações de permissão.
      </p>
    )
  }

  const profiles = profilesQuery.data?.data ?? []
  const permissions = catalog.data?.data ?? []

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
      <TabsList variant="outline">
        <TabsTrigger value="perfis">
          <HugeiconsIcon icon={UserSettings01Icon} strokeWidth={2} />
          Perfis
        </TabsTrigger>
        <TabsTrigger value="matriz">
          <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} />
          Matriz de permissões
        </TabsTrigger>
        <TabsTrigger value="vinculos">
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
          Vínculos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="perfis">
        <ProfilesTab
          profiles={profiles}
          onEditMatrix={(id) => {
            setProfileId(id)
            setTab("matriz")
          }}
        />
      </TabsContent>

      <TabsContent value="matriz">
        <MatrixTab
          permissions={permissions}
          profiles={profiles}
          profileId={profileId}
          onProfileChange={setProfileId}
        />
      </TabsContent>

      <TabsContent value="vinculos">
        <UserLinksTab profiles={profiles} />
      </TabsContent>
    </Tabs>
  )
}
