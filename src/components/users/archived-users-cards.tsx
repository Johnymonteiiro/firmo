"use client"

import {
  ArchivedCard,
  ArchivedCardGrid,
} from "@/components/archived/archived-cards"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import {
  USER_PROFILE_LABELS,
  useArchivedUsers,
  useUnarchiveUser,
  type UserProfile,
} from "@/lib/users"
import { formatDate } from "@/lib/format"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"

/** O card tem uma linha só para o perfil — acumulados vão separados por ponto. */
const profileLabels = (profiles: UserProfile[]): string =>
  profiles.map((profile) => USER_PROFILE_LABELS[profile]).join(" · ")

export function ArchivedUsersCards() {
  const { data, isLoading, isError, error } = useArchivedUsers(1, 100)
  const unarchive = useUnarchiveUser()
  const { can } = usePermissions()
  const items = data?.data ?? []

  return (
    <ArchivedCardGrid
      items={items}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="Nenhum usuário arquivado."
      searchPlaceholder="Buscar usuários..."
      getSearchText={(u) => `${u.name} ${u.email} ${profileLabels(u.profiles)}`}
      renderCard={(u) => (
        <ArchivedCard
          key={u.userId}
          topLabel={profileLabels(u.profiles)}
          statusBadge={<UserStatusBadge status={u.status} />}
          title={u.name}
          subtitle={u.email}
          fields={[
            { label: "Cadastrado em", value: formatDate(u.createdAt), mono: true },
          ]}
          archivedAt={u.deletedAt ?? u.updatedAt}
          entityLabel="usuário"
          onUnarchive={
            can(PERMISSIONS.usuariosArquivar)
              ? () => unarchive.mutateAsync(u.userId)
              : undefined
          }
          history={
            can(PERMISSIONS.auditoriaVisualizar)
              ? {
                  entity: "user",
                  recordId: u.userId,
                  subtitle: `${u.name} · ${u.email}`,
                }
              : undefined
          }
        />
      )}
    />
  )
}
