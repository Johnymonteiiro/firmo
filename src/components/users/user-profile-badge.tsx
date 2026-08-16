import { cn } from "@/lib/utils"
import { USER_PROFILE_LABELS, type UserProfile } from "@/lib/users"

/**
 * Administrador se destaca (é o perfil com poder sobre os demais); os outros
 * usam o tom neutro para não competir com o badge de status na mesma linha.
 */
const PROFILE_STYLE: Record<UserProfile, string> = {
  ADMINISTRADOR: "bg-sidebar-primary/15 text-sidebar-primary",
  GESTOR_CONTRATOS: "bg-muted text-foreground",
  FISCAL_ADMINISTRATIVO: "bg-muted text-foreground",
  FISCAL_TECNICO: "bg-muted text-foreground",
  SERVIDOR: "bg-muted text-muted-foreground",
  AUDITOR: "bg-muted text-muted-foreground",
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
