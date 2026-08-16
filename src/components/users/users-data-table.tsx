"use client"

import { DataTable } from "@/components/data-table/data-table"
import { userColumns } from "@/components/users/user-columns"
import { ImportUsersDialog } from "@/components/users/import-users-dialog"
import { NewUserDialog } from "@/components/users/new-user-dialog"
import { useUsers } from "@/lib/users"

export function UsersDataTable() {
  // UI-first: carrega um lote grande e deixa busca/ordenação/paginação client-side.
  const { data, isLoading, isError, error } = useUsers(1, 100)

  return (
    <DataTable
      columns={userColumns}
      data={data?.data ?? []}
      isLoading={isLoading}
      getRowId={(u) => u.userId}
      searchPlaceholder="Buscar usuários..."
      filters={[
        { columnId: "profile", title: "Perfil" },
        { columnId: "status", title: "Status" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <ImportUsersDialog />
          <NewUserDialog />
        </div>
      }
      emptyMessage={
        isError
          ? error instanceof Error
            ? error.message
            : "Erro ao carregar os usuários."
          : "Nenhum usuário cadastrado."
      }
    />
  )
}
