"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  USER_PROFILE_LABELS,
  USER_PROFILES,
  type UserProfile,
} from "@/lib/users"
import { cn } from "@/lib/utils"

/**
 * Seleção de perfis (RF-C04). São seis opções fixas e o usuário pode acumular
 * — uma grade de checkboxes mostra todas de uma vez, sem esconder o que já
 * está marcado atrás de um trigger fechado.
 */
export function ProfilesField({
  value,
  onChange,
  invalid,
  disabled,
}: {
  value: UserProfile[]
  onChange: (profiles: UserProfile[]) => void
  invalid?: boolean
  disabled?: boolean
}) {
  function toggle(profile: UserProfile, checked: boolean) {
    // Mantém a ordem do catálogo: a lista enviada não depende da ordem dos
    // cliques, e o diff da auditoria fica estável.
    onChange(
      USER_PROFILES.filter((item) =>
        item === profile ? checked : value.includes(item)
      )
    )
  }

  return (
    <div
      role="group"
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-3",
        invalid && "border-destructive",
        disabled && "opacity-50"
      )}
    >
      {USER_PROFILES.map((profile) => (
        <Label
          key={profile}
          className="flex items-center gap-2 font-normal"
        >
          <Checkbox
            checked={value.includes(profile)}
            disabled={disabled}
            onCheckedChange={(checked) => toggle(profile, checked === true)}
          />
          {USER_PROFILE_LABELS[profile]}
        </Label>
      ))}
    </div>
  )
}

/** Leitura — mesmo lugar do formulário, para quem não pode editar perfis. */
export function ProfilesReadonly({ profiles }: { profiles: UserProfile[] }) {
  return (
    <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      {profiles.map((profile) => USER_PROFILE_LABELS[profile]).join(" · ")}
    </p>
  )
}
