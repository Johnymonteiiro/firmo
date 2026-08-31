"use client"

import * as React from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  ProfileFormDialog,
  type ProfileFormMode,
} from "@/components/config/profile-form-dialog"
import { ProfileUsersDialog } from "@/components/config/profile-users-dialog"
import {
  DragHandle,
  SortableGrid,
  SortableItem,
} from "@/components/dnd/sortable-grid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOrderedIds } from "@/hooks/use-ordered-ids"
import { ApiError } from "@/lib/api"
import {
  useDeactivateProfile,
  type ProfileWithPermissions,
} from "@/lib/config"
import { PERMISSIONS, useCan } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Copy01Icon,
  Delete02Icon,
  PencilEdit02Icon,
  SecurityCheckIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

/**
 * RF-C02/RF-C05 — os perfis de permissão e o que se faz com eles. A matriz de
 * cada um fica na aba ao lado; daqui sai o atalho que abre ela já no perfil
 * certo.
 */
/** Ordem dos cards é preferência de quem usa — fica no navegador. */
const ORDER_KEY = "firmo:profiles-order"

export function ProfilesTab({
  profiles,
  onEditMatrix,
}: {
  profiles: ProfileWithPermissions[]
  onEditMatrix: (profileId: string) => void
}) {
  const deactivate = useDeactivateProfile()
  const canManage = useCan(PERMISSIONS.configuracoesGerenciarPerfis)

  const byId = React.useMemo(
    () => new Map(profiles.map((item) => [item.profile.profileId, item])),
    [profiles]
  )
  const profileIds = React.useMemo(
    () => profiles.map((item) => item.profile.profileId),
    [profiles]
  )
  const [ordered, setOrder] = useOrderedIds(ORDER_KEY, profileIds)

  const [formMode, setFormMode] = React.useState<ProfileFormMode | null>(null)
  const [target, setTarget] = React.useState<ProfileWithPermissions | null>(
    null
  )
  const [usersOf, setUsersOf] = React.useState<ProfileWithPermissions | null>(
    null
  )
  const [confirmRemove, setConfirmRemove] =
    React.useState<ProfileWithPermissions | null>(null)

  function handleRemove() {
    if (!confirmRemove) return
    deactivate.mutate(confirmRemove.profile.profileId, {
      onSuccess: (result) => {
        setConfirmRemove(null)
        toast.success(
          result.deleted
            ? "Perfil removido."
            : `Perfil desativado — ${result.activeUsers} usuário(s) ativo(s) ainda dependem dele.`
        )
      },
      onError: (error) => {
        setConfirmRemove(null)
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível remover o perfil."
        )
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {profiles.length} perfil(is) cadastrados. Perfis de sistema não podem
          ser excluídos nem desativados (RN-C06).
        </p>
        {canManage ? (
          <Button
            size="sm"
            onClick={() => {
              setTarget(null)
              setFormMode("create")
            }}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            Novo perfil
          </Button>
        ) : null}
      </div>

      <SortableGrid
        ids={ordered}
        onReorder={setOrder}
        className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {ordered.map((profileId) => {
          const item = byId.get(profileId)
          if (!item) return null

          return (
            <SortableItem key={profileId} id={profileId}>
              {({ handle, isDragging }) => (
          <article
            className={cn(
              "flex h-full flex-col gap-3 rounded-xl border bg-card p-4",
              isDragging && "ring-3 ring-ring/40"
            )}
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <DragHandle
                  label={`Reordenar ${item.profile.name}`}
                  className="-ml-1.5"
                  {...handle}
                />
                <h3 className="text-sm font-medium">{item.profile.name}</h3>
                {item.profile.isSystem ? (
                  <Badge variant="secondary">sistema</Badge>
                ) : null}
                {!item.profile.active ? (
                  <Badge variant="secondary">inativo</Badge>
                ) : null}
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {item.profile.description ?? "Sem descrição."}
              </p>
              <p className="font-mono text-2xs text-muted-foreground">
                {item.permissions.length} permissões · {item.userCount}{" "}
                usuário(s)
              </p>
            </div>

            <div className="mt-auto flex flex-wrap gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditMatrix(item.profile.profileId)}
              >
                <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} />
                Matriz
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUsersOf(item)}
              >
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
                Usuários
              </Button>

              {canManage ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTarget(item)
                      setFormMode("edit")
                    }}
                  >
                    <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTarget(item)
                      setFormMode("duplicate")
                    }}
                  >
                    <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
                    Duplicar
                  </Button>
                  {/* RN-C06: perfil de sistema não é excluído nem desativado. */}
                  {!item.profile.isSystem ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirmRemove(item)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                      Remover
                    </Button>
                  ) : null}
                </>
              ) : null}
            </div>
          </article>
              )}
            </SortableItem>
          )
        })}
      </SortableGrid>

      <ProfileFormDialog
        mode={formMode ?? "create"}
        profile={target?.profile}
        open={formMode !== null}
        onOpenChange={(open) => setFormMode(open ? formMode : null)}
      />

      <ProfileUsersDialog
        profile={usersOf?.profile ?? null}
        open={usersOf !== null}
        onOpenChange={(open) => setUsersOf(open ? usersOf : null)}
      />

      <ConfirmDialog
        open={confirmRemove !== null}
        onOpenChange={(open) => setConfirmRemove(open ? confirmRemove : null)}
        title={`Remover o perfil ${confirmRemove?.profile.name ?? ""}?`}
        description="Com usuários ativos vinculados o perfil é apenas desativado; sem nenhum, é removido da lista. Em nenhum dos casos o registro é apagado do banco."
        confirmLabel="Remover"
        destructive
        isPending={deactivate.isPending}
        onConfirm={handleRemove}
      />
    </div>
  )
}
