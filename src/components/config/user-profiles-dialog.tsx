"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/api"
import { useSetUserProfiles, type ProfileWithPermissions } from "@/lib/config"
import type { User } from "@/lib/users"

/**
 * RF-C04 — os perfis de um usuário. A API substitui o conjunto inteiro e
 * recusa lista vazia, então o botão só libera com ao menos um marcado.
 *
 * Perfis inativos (RN-C05) não entram na escolha, mas aparecem se o usuário
 * já os tiver — esconder um vínculo existente seria mentir sobre o acesso.
 */
export function UserProfilesDialog({
  user,
  profiles,
  open,
  onOpenChange,
}: {
  user: User | null
  profiles: ProfileWithPermissions[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const setUserProfiles = useSetUserProfiles()

  const current = React.useMemo(() => {
    // O usuário carrega slugs; a API de vínculo quer ids.
    const slugs = new Set<string>(user?.profiles ?? [])
    return new Set(
      profiles
        .filter((item) => slugs.has(item.profile.slug))
        .map((item) => item.profile.profileId)
    )
  }, [profiles, user?.profiles])

  const [selected, setSelected] = React.useState<Set<string>>(current)
  // O diálogo é remontado a cada abertura (`open &&` no chamador), então o
  // estado inicial já nasce com os perfis do usuário.
  const options = profiles.filter(
    (item) => item.profile.active || current.has(item.profile.profileId)
  )

  function toggle(profileId: string, checked: boolean) {
    const next = new Set(selected)
    if (checked) next.add(profileId)
    else next.delete(profileId)
    setSelected(next)
  }

  function handleSave() {
    if (!user || selected.size === 0) return
    setUserProfiles.mutate(
      { userId: user.userId, profileIds: [...selected] },
      {
        onSuccess: () => {
          toast.success(`Perfis de ${user.name} atualizados.`)
          onOpenChange(false)
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Não foi possível alterar os perfis do usuário."
          ),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perfis de {user?.name}</DialogTitle>
          <DialogDescription>
            O acesso passa a ser a soma das permissões dos perfis marcados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {options.map((item) => (
            <Label
              key={item.profile.profileId}
              className="flex items-start gap-3 rounded-lg border px-3 py-2 font-normal"
            >
              <Checkbox
                className="mt-0.5"
                checked={selected.has(item.profile.profileId)}
                onCheckedChange={(checked) =>
                  toggle(item.profile.profileId, checked === true)
                }
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm">{item.profile.name}</span>
                <span className="font-mono text-2xs text-muted-foreground">
                  {item.permissions.length} permissões
                  {item.profile.active ? "" : " · inativo"}
                </span>
              </span>
            </Label>
          ))}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={selected.size === 0 || setUserProfiles.isPending}
            title={
              selected.size === 0
                ? "O usuário precisa de ao menos um perfil."
                : undefined
            }
            onClick={handleSave}
          >
            {setUserProfiles.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
