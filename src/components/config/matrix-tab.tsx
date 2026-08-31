"use client"

import * as React from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PermissionMatrix } from "@/components/config/permission-matrix"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api"
import {
  useSetProfilePermissions,
  type Permission,
  type ProfileWithPermissions,
} from "@/lib/config"
import { PERMISSIONS, useCan } from "@/lib/permissions"
import type { PermissionKey } from "@/lib/permissions"

/**
 * RF-C03 — a matriz de um perfil. A tela envia o estado final dos toggles (o
 * backend grava a matriz inteira) e a gravação passa pela confirmação da
 * RN-C02, mostrando quantos usuários serão afetados.
 */
export function MatrixTab({
  permissions,
  profiles,
  profileId,
  onProfileChange,
}: {
  permissions: Permission[]
  profiles: ProfileWithPermissions[]
  profileId: string | null
  onProfileChange: (profileId: string) => void
}) {
  const savePermissions = useSetProfilePermissions()
  const canManage = useCan(PERMISSIONS.configuracoesGerenciarPermissoes)

  const [draft, setDraft] = React.useState<{
    profileId: string
    keys: Set<PermissionKey>
  } | null>(null)
  const [confirmSave, setConfirmSave] = React.useState(false)

  const selected =
    profiles.find((item) => item.profile.profileId === profileId) ?? profiles[0]
  const selectedId = selected?.profile.profileId ?? null

  const saved = React.useMemo(
    () => new Set(selected?.permissions ?? []),
    [selected?.permissions]
  )

  // Trocar de perfil descarta o rascunho: em vez de zerá-lo num efeito (render
  // extra a cada seleção), ele simplesmente deixa de valer quando é de outro
  // perfil.
  const activeDraft = draft?.profileId === selectedId ? draft.keys : null
  const granted = activeDraft ?? saved

  const isDirty =
    activeDraft !== null &&
    (activeDraft.size !== saved.size ||
      [...activeDraft].some((key) => !saved.has(key)))

  function setGranted(next: Set<PermissionKey>) {
    if (!selectedId) return
    setDraft({ profileId: selectedId, keys: next })
  }

  function toggle(key: PermissionKey, checked: boolean) {
    const next = new Set(granted)
    if (checked) next.add(key)
    else next.delete(key)
    setGranted(next)
  }

  function toggleModule(keys: PermissionKey[], checked: boolean) {
    const next = new Set(granted)
    for (const key of keys) {
      if (checked) next.add(key)
      else next.delete(key)
    }
    setGranted(next)
  }

  function handleSave() {
    if (!selected || !activeDraft) return
    savePermissions.mutate(
      { profileId: selected.profile.profileId, permissions: [...activeDraft] },
      {
        onSuccess: (result) => {
          setConfirmSave(false)
          setDraft(null)
          toast.success(
            result.affectedUsers === 0
              ? "Matriz salva. Nenhum usuário vinculado."
              : `Matriz salva. ${result.affectedUsers} usuário(s) tiveram o acesso alterado.`
          )
        },
        onError: (error) => {
          setConfirmSave(false)
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível salvar a matriz."
          )
        },
      }
    )
  }

  if (!selected) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum perfil cadastrado.</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Perfil</Label>
          <Select
            value={selected.profile.profileId}
            onValueChange={onProfileChange}
          >
            <SelectTrigger className="w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((item) => (
                <SelectItem
                  key={item.profile.profileId}
                  value={item.profile.profileId}
                >
                  {item.profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selected.profile.isSystem ? (
            <Badge variant="secondary">perfil de sistema</Badge>
          ) : null}
          <span className="font-mono text-2xs text-muted-foreground">
            {granted.size}/{permissions.length} permissões ·{" "}
            {selected.userCount} usuário(s)
          </span>
        </div>
      </div>

      {canManage ? null : (
        <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
          Você pode consultar a matriz, mas não alterá-la — falta a permissão{" "}
          <code>configuracoes:gerenciar_permissoes</code>.
        </p>
      )}

      <PermissionMatrix
        permissions={permissions}
        granted={granted}
        onToggle={toggle}
        onToggleModule={toggleModule}
        disabled={!canManage}
      />

      {canManage ? (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background/95 py-3 backdrop-blur">
          {isDirty ? (
            <span className="mr-auto text-xs text-muted-foreground">
              Alterações não salvas.
            </span>
          ) : null}
          <Button
            variant="outline"
            disabled={!isDirty}
            onClick={() => setDraft(null)}
          >
            Descartar
          </Button>
          <Button disabled={!isDirty} onClick={() => setConfirmSave(true)}>
            Salvar matriz
          </Button>
        </div>
      ) : null}

      {/* RN-C02: gravar permissão passa por confirmação explícita. */}
      <ConfirmDialog
        open={confirmSave}
        onOpenChange={setConfirmSave}
        title="Salvar a matriz deste perfil?"
        description={`${selected.userCount} usuário(s) com o perfil ${selected.profile.name} terão o acesso alterado em até um minuto.`}
        confirmLabel="Salvar"
        pendingLabel="Salvando…"
        isPending={savePermissions.isPending}
        onConfirm={handleSave}
      />
    </div>
  )
}
