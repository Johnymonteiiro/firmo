import { cn } from "@/lib/utils"
import { USER_PROFILE_LABELS, type UserProfile } from "@/lib/users"

/**
 * Administrador se destaca (é o perfil com poder sobre os demais); os outros
 * usam o tom neutro para não competir com o badge de status na mesma linha.
 */
const PROFILE_STYLE: Record<UserProfile, string> = {
  ADMINISTRADOR: "bg-sidebar-primary/15 text-sidebar-primary",
  GESTOR_CONTRATOS: "bg-muted text-foreground",
  GESTOR_FINANCEIRO: "bg-muted text-foreground",
  VISITANTE: "bg-muted text-muted-foreground",
}

export function UserProfileBadge({ profile }: { profile: UserProfile }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        PROFILE_STYLE[profile]
      )}
    >
      {USER_PROFILE_LABELS[profile]}
    </span>
  )
}

/**
 * Um usuário pode acumular perfis (RF-C04). A ordem do catálogo — e não a que
 * o banco devolveu — mantém o Administrador sempre à frente, para que a linha
 * não mude de aparência conforme a ordem de gravação.
 */
export function UserProfileBadges({
  profiles,
  className,
}: {
  profiles: UserProfile[]
  className?: string
}) {
  const ordered = USER_PROFILES_ORDER.filter((profile) =>
    profiles.includes(profile)
  )

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {ordered.map((profile) => (
        <UserProfileBadge key={profile} profile={profile} />
      ))}
    </span>
  )
}

const USER_PROFILES_ORDER = Object.keys(PROFILE_STYLE) as UserProfile[]
