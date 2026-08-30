"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import {
  USER_PROFILE_LABELS,
  useSelectableUsers,
  type User,
} from "@/lib/users"
import { cn } from "@/lib/utils"

/**
 * Seleção de responsáveis de contrato. O projeto não tem `cmdk`, então a
 * busca é um Input filtrando a lista dentro de um Popover — sem dependência
 * nova.
 */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

function matches(user: User, term: string): boolean {
  if (!term) return true
  const needle = normalize(term)
  return (
    normalize(user.name).includes(needle) ||
    normalize(user.email).includes(needle)
  )
}

function UserRow({ user }: { user: User }) {
  return (
    <div className="flex min-w-0 flex-col text-left">
      <span className="truncate text-sm">{user.name}</span>
      <span className="truncate text-xs text-muted-foreground">
        {user.email} ·{" "}
        {user.profiles.map((p) => USER_PROFILE_LABELS[p]).join(" · ")}
      </span>
    </div>
  )
}

function PickerShell({
  open,
  onOpenChange,
  triggerLabel,
  placeholder,
  invalid,
  disabled,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerLabel: React.ReactNode
  placeholder: string
  invalid?: boolean
  disabled?: boolean
  children: (users: User[]) => React.ReactNode
}) {
  const [term, setTerm] = React.useState("")
  const { users, isLoading, isError, isTruncated } = useSelectableUsers()

  const visible = users.filter((user) => matches(user, term))

  React.useEffect(() => {
    if (!open) setTerm("")
  }, [open])

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          disabled={disabled}
          className="h-auto min-h-9 w-full justify-between gap-2 px-3 py-1.5 font-normal"
        >
          {triggerLabel}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="size-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) gap-2 p-2" align="start">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={placeholder}
            className="pl-8"
          />
        </div>

        {isTruncated ? (
          <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            Mostrando os 100 primeiros usuários ativos — refine a busca.
          </p>
        ) : null}

        <div className="max-h-56 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              Carregando usuários…
            </div>
          ) : isError ? (
            <p className="py-6 text-center text-sm text-destructive">
              Não foi possível carregar os usuários.
            </p>
          ) : visible.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {users.length === 0
                ? "Nenhum usuário ativo."
                : "Nenhum usuário encontrado."}
            </p>
          ) : (
            children(visible)
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Papel com vários responsáveis — vale para os três: gestor e fiscais. */
export function UserMultiPicker({
  value,
  onChange,
  legacyName,
  invalid,
  disabled,
  placeholder = "Selecione os responsáveis",
}: {
  value: string[]
  onChange: (userIds: string[]) => void
  legacyName?: string
  invalid?: boolean
  disabled?: boolean
  /** Texto do botão quando nada foi escolhido ainda. */
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const { users } = useSelectableUsers()
  const selected = users.filter((user) => value.includes(user.userId))

  function toggle(userId: string) {
    onChange(
      value.includes(userId)
        ? value.filter((id) => id !== userId)
        : [...value, userId]
    )
  }

  const label =
    selected.length > 0 ? (
      <span className="flex flex-wrap gap-1">
        {selected.map((user) => (
          <Badge key={user.userId} variant="secondary" className="gap-1">
            {user.name}
            <span
              role="button"
              tabIndex={0}
              aria-label={`Remover ${user.name}`}
              className="rounded-full hover:text-destructive"
              onClick={(event) => {
                event.stopPropagation()
                toggle(user.userId)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  event.stopPropagation()
                  toggle(user.userId)
                }
              }}
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2}
                className="size-3"
              />
            </span>
          </Badge>
        ))}
      </span>
    ) : legacyName ? (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{legacyName}</span>
        <Badge variant="secondary" className="shrink-0">
          sem vínculo
        </Badge>
      </span>
    ) : (
      <span className="text-muted-foreground">{placeholder}</span>
    )

  return (
    <PickerShell
      open={open}
      onOpenChange={setOpen}
      triggerLabel={label}
      placeholder="Buscar por nome ou e-mail"
      invalid={invalid}
      disabled={disabled}
    >
      {(visible) => (
        <ul className="flex flex-col">
          {visible.map((user) => {
            const checked = value.includes(user.userId)
            return (
              <li key={user.userId}>
                <button
                  type="button"
                  onClick={() => toggle(user.userId)}
                  className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                >
                  <UserRow user={user} />
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                      checked && "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {checked ? (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        strokeWidth={2}
                        className="size-3"
                      />
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </PickerShell>
  )
}
