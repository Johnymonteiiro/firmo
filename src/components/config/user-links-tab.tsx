"use client"

import * as React from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

import { UserProfilesDialog } from "@/components/config/user-profiles-dialog"
import { actionsColumn } from "@/components/data-table/columns"
import { DataTable } from "@/components/data-table/data-table"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { Button } from "@/components/ui/button"
import { UserProfileBadges } from "@/components/users/user-profile-badge"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import type { ProfileWithPermissions } from "@/lib/config"
import { PERMISSIONS, useCan } from "@/lib/permissions"
import {
  USER_PROFILE_LABELS,
  USER_STATUS_LABELS,
  useUsers,
  type User,
} from "@/lib/users"

const USER_URL = "/dashboard/usuarios"

/**
 * Filtro multi-seleção. A célula de perfis guarda uma lista — basta uma
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

function userLinkColumns(
  profiles: ProfileWithPermissions[],
  canManage: boolean
): ColumnDef<User>[] {
  return [
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
        <DataGridColumnHeader title="Perfis" column={column} />
      ),
      cell: ({ row }) => <UserProfileBadges profiles={row.original.profiles} />,
      filterFn: inArrayFilter,
      size: 240,
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
    actionsColumn(({ row }) =>
      canManage ? (
        <UserLinkActionsCell user={row.original} profiles={profiles} />
      ) : null
    ),
  ]
}

/**
 * Alterar perfis é a única ação daqui, então fica como botão visível em vez
 * de escondida atrás do menu de três pontos das outras tabelas.
 */
function UserLinkActionsCell({
  user,
  profiles,
}: {
  user: User
  profiles: ProfileWithPermissions[]
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7"
        onClick={() => setOpen(true)}
      >
        Alterar perfis
      </Button>
      {/* Montado só quando abre: o diálogo nasce com os perfis atuais. */}
      {open ? (
        <UserProfilesDialog
          user={user}
          profiles={profiles}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </>
  )
}

/**
 * RF-C04 pelo lado do usuário: quem tem quais perfis. A visão por perfil
 * (RF-C05) fica na aba Perfis — as duas leem o mesmo vínculo.
 */
export function UserLinksTab({
  profiles,
}: {
  profiles: ProfileWithPermissions[]
}) {
  const { data, isLoading, isError, error } = useUsers(1, 100)
  const canManage = useCan(PERMISSIONS.configuracoesGerenciarPermissoes)

  const columns = React.useMemo(
    () => userLinkColumns(profiles, canManage),
    [profiles, canManage]
  )

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      getRowId={(user) => user.userId}
      searchPlaceholder="Buscar por nome ou e-mail..."
      filters={[
        { columnId: "profile", title: "Perfil" },
        { columnId: "status", title: "Status" },
      ]}
      emptyMessage={
        isError
          ? error instanceof Error
            ? error.message
            : "Não foi possível carregar os usuários."
          : "Nenhum usuário encontrado."
      }
    />
  )
}
