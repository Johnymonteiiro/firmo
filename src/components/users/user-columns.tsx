"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import {
  DataTableRowActions,
  type StatusOption,
} from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import { UserProfileBadges } from "@/components/users/user-profile-badge"
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
import { PERMISSIONS, usePermissions } from "@/lib/permissions"

/**
 * Filtro multi-seleção (valor = array de strings). A célula pode guardar um
 * valor só (status) ou uma lista (perfis, RF-C04) — no segundo caso basta uma
 * interseção para a linha passar.
 */
function inArrayFilter(
  row: { getValue: (id: string) => unknown },
  id: string,
  value: string[]
) {
  if (!value?.length) return true
  const cell = row.getValue(id)
  return Array.isArray(cell)
    ? cell.some((item) => value.includes(item as string))
    : value.includes(cell as string)
}

const USER_URL = "/dashboard/usuarios"

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
      <Link
        href={`${USER_URL}/${row.original.userId}`}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
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
    accessorFn: (row) => row.profiles.map((p) => USER_PROFILE_LABELS[p]),
    // Sem isto o filtro ofereceria a combinação inteira ("Auditor,Servidor")
    // como se fosse um valor — a faceta precisa ver um perfil por vez.
    getUniqueValues: (row) => row.profiles.map((p) => USER_PROFILE_LABELS[p]),
    header: ({ column }) => (
      <DataGridColumnHeader title="Perfil" column={column} />
    ),
    cell: ({ row }) => <UserProfileBadges profiles={row.original.profiles} />,
    filterFn: inArrayFilter,
    size: 200,
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
  const router = useRouter()
  const [editOpen, setEditOpen] = React.useState(false)
  const archive = useArchiveUser()
  const changeStatus = useChangeUserStatus()
  const { can } = usePermissions()

  // Editar e alterar status saem da mesma permissão (`usuarios:editar`);
  // arquivar tem a sua própria.
  const canEdit = can(PERMISSIONS.usuariosEditar)

  return (
    <>
      <DataTableRowActions
        entityLabel="usuário"
        onDetails={() => router.push(`${USER_URL}/${user.userId}`)}
        onEdit={canEdit ? () => setEditOpen(true) : undefined}
        onChangeStatus={
          canEdit
            ? (status) =>
                changeStatus.mutateAsync({ userId: user.userId, status })
            : undefined
        }
        statusOptions={USER_STATUS_OPTIONS}
        currentStatus={user.status}
        history={
          can(PERMISSIONS.auditoriaVisualizar)
            ? {
                entity: "user",
                recordId: user.userId,
                subtitle: `${user.name} · ${user.email}`,
              }
            : undefined
        }
        onArchive={
          can(PERMISSIONS.usuariosArquivar)
            ? () => archive.mutateAsync(user.userId)
            : undefined
        }
      />
      <EditUserDialog user={user} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
