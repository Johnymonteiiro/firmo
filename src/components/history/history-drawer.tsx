"use client"

import * as React from "react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { CommitmentReinforcementsPanel } from "@/components/reinforcements/commitment-reinforcements-panel"
import { cn } from "@/lib/utils"
import {
  useHistory,
  type AuditEntity,
  type AuditLog,
  type AuditOperation,
} from "@/lib/audit"
import {
  auditFieldLabel,
  formatAuditValue,
  IGNORED_AUDIT_KEYS,
} from "@/lib/audit-format"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

const OP_META: Record<
  AuditOperation,
  { label: string; badge: string; dot: string }
> = {
  INSERT: { label: "Criado", badge: "bg-success/15 text-success", dot: "bg-success" },
  UPDATE: { label: "Atualizado", badge: "bg-info/15 text-info", dot: "bg-info" },
  DELETE: {
    label: "Arquivado",
    badge: "bg-destructive/15 text-destructive",
    dot: "bg-destructive",
  },
}

/** Origem do evento — usado no histórico unificado (empenho + reforços). */
const TABLE_LABEL: Record<string, string> = {
  rel_contrato: "Contrato",
  rel_empenho: "Empenho",
  reforco_empenho: "Reforço",
  faturamento: "Faturamento",
}

type Tab = "all" | "update" | "insert"
const TAB_LABEL: Record<Tab, string> = {
  all: "Tudo",
  update: "Alterações",
  insert: "Criação",
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((today.getTime() - a.getTime()) / 86_400_000)
  if (diff === 0) return "HOJE"
  if (diff === 1) return "ONTEM"
  return d
    .toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase()
}

function dateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function changedFields(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
) {
  const keys = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ])
  const out: { key: string; before: unknown; after: unknown }[] = []
  for (const key of keys) {
    if (IGNORED_AUDIT_KEYS.has(key)) continue
    const b = before?.[key]
    const a = after?.[key]
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      out.push({ key, before: b, after: a })
    }
  }
  return out
}

function snapshotFields(data: Record<string, unknown> | null) {
  if (!data) return []
  return Object.keys(data)
    .filter((k) => !IGNORED_AUDIT_KEYS.has(k) && !k.endsWith("_id"))
    .map((k) => ({ key: k, value: data[k] }))
}

export function HistoryDrawer({
  entity,
  recordId,
  entityLabel,
  subtitle,
  open,
  onOpenChange,
}: {
  entity: AuditEntity
  recordId: string | null
  entityLabel: string
  subtitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = React.useState<Tab>("all")
  const { data, isLoading, isError, error } = useHistory(entity, recordId, open)

  const entries = (data?.data ?? []).filter((e) =>
    tab === "all"
      ? true
      : tab === "update"
        ? e.operacao === "UPDATE"
        : e.operacao === "INSERT"
  )

  const groups: { label: string; items: AuditLog[] }[] = []
  for (const e of entries) {
    const label = dayLabel(e.data)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(e)
    else groups.push({ label, items: [e] })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 p-0"
        style={{ maxWidth: "min(480px, 100vw)" }}
      >
        <SheetHeader className="shrink-0 gap-1 border-b p-5">
          <p className="text-2xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">
            Trilha de auditoria
          </p>
          <SheetTitle className="text-lg">Histórico do {entityLabel}</SheetTitle>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1">
              {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm transition-colors",
                    tab === t
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {TAB_LABEL[t]}
                </button>
              ))}
            </div>
            {!isLoading ? (
              <span className="text-xs text-muted-foreground">
                {entries.length} evento{entries.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Histórico unificado do empenho: reforços ativos com ação Anular. */}
          {entity === "commitment" && recordId ? (
            <div className="mb-5">
              <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                Reforços ativos
              </p>
              <CommitmentReinforcementsPanel commitmentId={recordId} />
            </div>
          ) : null}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Erro ao carregar o histórico."}
            </p>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sem eventos para mostrar.
            </p>
          ) : (
            <div className="space-y-5">
              {groups.map((g) => (
                <div key={g.label}>
                  <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    {g.label}
                  </p>
                  <ol className="relative ml-1 space-y-4 border-l border-border pl-5">
                    {g.items.map((e) => (
                      <Event
                        key={e.auditLogId}
                        entry={e}
                        showOrigin={entity === "commitment"}
                      />
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Event({
  entry,
  showOrigin = false,
}: {
  entry: AuditLog
  showOrigin?: boolean
}) {
  let meta = OP_META[entry.operacao] ?? {
    label: entry.operacao,
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  }
  // Soft delete de reforço é anulação (definitiva), não arquivamento.
  if (entry.operacao === "DELETE" && entry.tabela === "reforco_empenho") {
    meta = { ...meta, label: "Anulado" }
  }

  return (
    <li className="relative">
      <span
        className={cn(
          "absolute -left-6 top-1 size-2.5 rounded-full ring-4 ring-background",
          meta.dot
        )}
      />
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 font-medium",
            meta.badge
          )}
        >
          {meta.label}
        </span>
        {showOrigin && TABLE_LABEL[entry.tabela] ? (
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
            {TABLE_LABEL[entry.tabela]}
          </span>
        ) : null}
        <span className="font-mono text-muted-foreground tabular-nums">
          {dateTime(entry.data)}
        </span>
        {entry.alteradoPor ? (
          <span className="text-muted-foreground">
            · por{" "}
            <span className="font-medium text-foreground">
              {entry.alteradoPor}
            </span>
          </span>
        ) : null}
      </div>

      {entry.operacao === "UPDATE" ? (
        <UpdateBody entry={entry} />
      ) : entry.operacao === "INSERT" ? (
        <InsertBody entry={entry} />
      ) : null}
    </li>
  )
}

function UpdateBody({ entry }: { entry: AuditLog }) {
  const changes = changedFields(entry.dadosAntes, entry.dadosDepois)
  if (changes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sem alterações de campos.</p>
    )
  }
  return (
    <div className="space-y-2.5 rounded-lg border bg-card p-3">
      {changes.map((c) => (
        <div key={c.key} className="text-sm">
          <div className="text-xs font-medium">{auditFieldLabel(c.key)}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono">
            <span className="text-destructive/80 line-through">
              {formatAuditValue(c.key, c.before)}
            </span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-3.5 text-muted-foreground"
            />
            <span className="text-success">
              {formatAuditValue(c.key, c.after)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function InsertBody({ entry }: { entry: AuditLog }) {
  const fields = snapshotFields(entry.dadosDepois)
  if (fields.length === 0) return null
  return (
    <div className="rounded-lg border bg-card p-3">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {fields.map((f) => (
          <React.Fragment key={f.key}>
            <dt className="text-muted-foreground">{auditFieldLabel(f.key)}</dt>
            <dd className="text-right font-mono">
              {formatAuditValue(f.key, f.value)}
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  )
}
