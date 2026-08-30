"use client"

import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  actionLabel,
  moduleLabel,
  permissionLabel,
  type Permission,
} from "@/lib/config"
import type { PermissionKey } from "@/lib/permissions"
import { cn } from "@/lib/utils"

/**
 * Matriz da RF-C03 para **um** perfil: as permissões do catálogo agrupadas por
 * módulo, cada uma com o seu toggle. A tela envia o estado final (o backend
 * grava a matriz inteira), então o que está aqui é sempre a verdade completa
 * do perfil — não um diff.
 */
export function PermissionMatrix({
  permissions,
  granted,
  onToggle,
  onToggleModule,
  disabled,
}: {
  permissions: Permission[]
  granted: Set<PermissionKey>
  onToggle: (key: PermissionKey, checked: boolean) => void
  onToggleModule: (keys: PermissionKey[], checked: boolean) => void
  disabled?: boolean
}) {
  const modules = React.useMemo(() => {
    const grouped = new Map<string, Permission[]>()
    for (const permission of permissions) {
      const list = grouped.get(permission.module) ?? []
      list.push(permission)
      grouped.set(permission.module, list)
    }
    return [...grouped.entries()]
  }, [permissions])

  return (
    <div className="flex flex-col gap-4">
      {modules.map(([module, items]) => {
        const keys = items.map(permissionLabel) as PermissionKey[]
        const checkedCount = keys.filter((key) => granted.has(key)).length
        const all = checkedCount === keys.length
        const some = checkedCount > 0 && !all

        return (
          <section
            key={module}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <header className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  checked={all ? true : some ? "indeterminate" : false}
                  disabled={disabled}
                  aria-label={`Marcar todas as permissões de ${moduleLabel(module)}`}
                  onCheckedChange={(checked) =>
                    onToggleModule(keys, checked === true)
                  }
                />
                <span className="text-sm font-medium">
                  {moduleLabel(module)}
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {checkedCount}/{keys.length}
              </span>
            </header>

            <ul className="divide-y">
              {items.map((permission) => {
                const key = permissionLabel(permission) as PermissionKey
                return (
                  <li key={key} className="px-4 py-2.5">
                    <Label className="flex items-start gap-3 font-normal">
                      <Checkbox
                        className="mt-0.5"
                        checked={granted.has(key)}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                          onToggle(key, checked === true)
                        }
                      />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm">
                            {actionLabel(permission.action)}
                          </span>
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-2xs text-muted-foreground">
                            {key}
                          </code>
                        </span>
                        {permission.description ? (
                          <span className="text-xs text-muted-foreground">
                            {permission.description}
                          </span>
                        ) : null}
                        <RouteList routes={permission.routes} />
                      </span>
                    </Label>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

/**
 * As rotas cobertas ficam recolhidas: são o detalhe que explica o toggle
 * quando alguém duvida do que ele libera, e ruído no resto do tempo.
 */
function RouteList({
  routes,
}: {
  routes: { method: string; pattern: string }[]
}) {
  const [open, setOpen] = React.useState(false)
  if (routes.length === 0) return null

  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        className="w-fit text-xs text-muted-foreground underline-offset-2 hover:underline"
        onClick={(event) => {
          // O rótulo inteiro é clicável para marcar — este botão não pode
          // arrastar o checkbox junto.
          event.preventDefault()
          setOpen((value) => !value)
        }}
      >
        {open ? "Ocultar rotas" : `${routes.length} rota(s)`}
      </button>
      {open ? (
        <span className="flex flex-col gap-0.5">
          {routes.map((route) => (
            <code
              key={`${route.method} ${route.pattern}`}
              className="font-mono text-2xs text-muted-foreground"
            >
              <span className={cn("font-semibold", methodTone(route.method))}>
                {route.method}
              </span>{" "}
              {route.pattern}
            </code>
          ))}
        </span>
      ) : null}
    </span>
  )
}

function methodTone(method: string): string {
  if (method === "GET") return "text-info"
  if (method === "DELETE") return "text-destructive"
  return "text-warning"
}
