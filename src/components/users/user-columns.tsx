"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import {
  DataTableRowActions,
  type StatusOption,
} from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import { UserProfileBadge } from "@/components/users/user-profile-badge"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import {
  USER_PROFILE_LABELS,
  USER_STATUS_LABELS,
  useArchiveUser,
  useChangeUserStatus,
  type User,
  type UserStatus,
} from "@/lib/users"
import { formatDate } from "@/lib/format"

/** Filtro multi-seleção (valor = array de strings). */
function inArrayFilter(
  row: { getValue: (id: string) => unknown },
  id: string,
  value: string[]
) {
  return !value?.length || value.includes(row.getValue(id) as string)
}

const USER_STATUS_OPTIONS: StatusOption<UserStatus>[] = [
  { value: "ATIVO", label: "Ativar", dotClass: "bg-success" },
  { value: "INATIVO", label: "Desativar", dotClass: "bg-muted-foreground" },
  { value: "SUSPENSO", label: "Suspender", dotClass: "bg-warning" },
]

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    id: "name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Nome" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
    size: 200,
  },
  {
    accessorKey: "email",
    id: "email",
    header: ({ column }) => (
      <DataGridColumnHeader title="E-mail" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.email}</span>
    ),
    size: 230,
  },
  {
    id: "profile",
    accessorFn: (row) => USER_PROFILE_LABELS[row.profile],
    header: ({ column }) => (
      <DataGridColumnHeader title="Perfil" column={column} />
    ),
    cell: ({ row }) => <UserProfileBadge profile={row.original.profile} />,
    filterFn: inArrayFilter,
    size: 170,
  },
  {
    id: "status",
    accessorFn: (row) => USER_STATUS_LABELS[row.status],
    header: ({ column }) => (
      <DataGridColumnHeader title="Status" column={column} />
    ),
    cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
    filterFn: inArrayFilter,
    size: 110,
  },
  {
    accessorKey: "createdAt",
    id: "createdAt",
    header: ({ column }) => (
      <DataGridColumnHeader title="Cadastrado em" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {formatDate(row.original.createdAt)}
      </span>
    ),
    size: 130,
  },
  actionsColumn(({ row }) => <UserActionsCell user={row.original} />),
]

function UserActionsCell({ user }: { user: User }) {
  const [editOpen, setEditOpen] = React.useState(false)
  const archive = useArchiveUser()
  const changeStatus = useChangeUserStatus()

  return (
    <>
      <DataTableRowActions
        entityLabel="usuário"
        onEdit={() => setEditOpen(true)}
        onChangeStatus={(status) =>
          changeStatus.mutateAsync({ userId: user.userId, status })
        }
        statusOptions={USER_STATUS_OPTIONS}
        currentStatus={user.status}
        history={{
          entity: "user",
          recordId: user.userId,
          subtitle: `${user.name} · ${user.email}`,
        }}
        onArchive={() => archive.mutateAsync(user.userId)}
      />
      <EditUserDialog user={user} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
