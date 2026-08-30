"use client"

import Link from "next/link"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { UserProfileBadges } from "@/components/users/user-profile-badge"
import { useProfileUsers, type PermissionProfile } from "@/lib/config"
import { useUsers } from "@/lib/users"

/**
 * RF-C05 — quem está vinculado ao perfil. A API devolve os ids; nome e e-mail
 * saem da listagem de usuários.
 *
 * É leitura: alterar vínculo é por usuário, na aba Vínculos — lá dá para ver
 * o conjunto inteiro de perfis da pessoa antes de mexer, que é o que a API
 * substitui.
 */
export function ProfileUsersDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PermissionProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data, isLoading, isError } = useProfileUsers(
    open ? (profile?.profileId ?? null) : null
  )
  const users = useUsers(1, 100)

  const byId = new Map((users.data?.data ?? []).map((u) => [u.userId, u]))
  const ids = data?.data ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Usuários do perfil {profile?.name}</DialogTitle>
          <DialogDescription>
            Alterar a matriz deste perfil muda o acesso de todos eles.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar os usuários do perfil.
          </p>
        ) : ids.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum usuário vinculado a este perfil.
          </p>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto rounded-lg border">
            {ids.map((userId) => {
              const user = byId.get(userId)
              return (
                <li key={userId} className="px-3 py-2 text-sm">
                  {user ? (
                    <Link
                      href={`/dashboard/usuarios/${userId}`}
                      className="flex flex-col gap-1 hover:underline"
                    >
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                      <UserProfileBadges profiles={user.profiles} />
                    </Link>
                  ) : (
                    // Usuário fora da página carregada (ou arquivado): o
                    // vínculo existe e precisa aparecer mesmo assim.
                    <span className="font-mono text-xs text-muted-foreground">
                      {userId}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
