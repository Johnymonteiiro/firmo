import { cn } from "@/lib/utils"
import { USER_STATUS_LABELS, type UserStatus } from "@/lib/users"

const STATUS_STYLE: Record<UserStatus, string> = {
  ATIVO: "bg-success/15 text-success",
  INATIVO: "bg-muted text-muted-foreground",
  SUSPENSO: "bg-warning/15 text-warning",
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLE[status]
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {USER_STATUS_LABELS[status]}
    </span>
  )
}
