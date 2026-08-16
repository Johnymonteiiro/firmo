"use client"

import {
  ArchivedCard,
  ArchivedCardGrid,
} from "@/components/archived/archived-cards"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import { USER_PROFILE_LABELS, useArchivedUsers, useUnarchiveUser } from "@/lib/users"
import { formatDate } from "@/lib/format"

export function ArchivedUsersCards() {
  const { data, isLoading, isError, error } = useArchivedUsers(1, 100)
  const unarchive = useUnarchiveUser()
  const items = data?.data ?? []

  return (
    <ArchivedCardGrid
      items={items}
      isLoading={isLoading}
      isError={isError}
      error={error}
      emptyMessage="Nenhum usuário arquivado."
      searchPlaceholder="Buscar usuários..."
      getSearchText={(u) => `${u.name} ${u.email} ${USER_PROFILE_LABELS[u.profile]}`}
      renderCard={(u) => (
        <ArchivedCard
          key={u.userId}
          topLabel={USER_PROFILE_LABELS[u.profile]}
          statusBadge={<UserStatusBadge status={u.status} />}
          title={u.name}
          subtitle={u.email}
          fields={[
            { label: "Cadastrado em", value: formatDate(u.createdAt), mono: true },
          ]}
          archivedAt={u.deletedAt ?? u.updatedAt}
          entityLabel="usuário"
          onUnarchive={() => unarchive.mutateAsync(u.userId)}
          history={{
            entity: "user",
            recordId: u.userId,
            subtitle: `${u.name} · ${u.email}`,
          }}
        />
      )}
    />
  )
}
