"use client"

import * as React from "react"
import Link from "next/link"

import { UserProfilesDialog } from "@/components/config/user-profiles-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { UserProfileBadges } from "@/components/users/user-profile-badge"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import type { ProfileWithPermissions } from "@/lib/config"
import { PERMISSIONS, useCan } from "@/lib/permissions"
import { useUsers, type User } from "@/lib/users"

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

/**
 * RF-C04 pelo lado do usuário: quem tem quais perfis. A visão por perfil
 * (RF-C05) fica na aba Perfis — as duas leem o mesmo vínculo.
 */
export function UserLinksTab({
  profiles,
}: {
  profiles: ProfileWithPermissions[]
}) {
  const { data, isLoading, isError } = useUsers(1, 100)
  const canManage = useCan(PERMISSIONS.configuracoesGerenciarPermissoes)

  const [term, setTerm] = React.useState("")
  const [target, setTarget] = React.useState<User | null>(null)

  const users = (data?.data ?? []).filter((user) => {
    if (!term) return true
    const needle = normalize(term)
    return (
      normalize(user.name).includes(needle) ||
      normalize(user.email).includes(needle)
    )
  })

  if (isLoading) return <Skeleton className="h-72 w-full" />
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os usuários.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="w-80"
        />
        <span className="text-xs text-muted-foreground">
          {users.length} de {data?.total ?? 0} usuário(s)
        </span>
      </div>

      <ul className="divide-y rounded-xl border bg-card">
        {users.map((user) => (
          <li
            key={user.userId}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <Link
                href={`/dashboard/usuarios/${user.userId}`}
                className="text-sm font-medium hover:underline"
              >
                {user.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
              <span className="flex flex-wrap items-center gap-1.5">
                <UserProfileBadges profiles={user.profiles} />
                <UserStatusBadge status={user.status} />
              </span>
            </div>

            {canManage ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTarget(user)}
              >
                Alterar perfis
              </Button>
            ) : null}
          </li>
        ))}

        {users.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum usuário encontrado.
          </li>
        ) : null}
      </ul>

      {/* Montado só quando abre: o diálogo nasce com os perfis atuais. */}
      {target ? (
        <UserProfilesDialog
          user={target}
          profiles={profiles}
          open
          onOpenChange={(open) => setTarget(open ? target : null)}
        />
      ) : null}
    </div>
  )
}
