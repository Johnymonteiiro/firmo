"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { HistoryDrawer } from "@/components/history/history-drawer"
import { ApiError } from "@/lib/api"
import { formatDate } from "@/lib/format"
import type { AuditEntity } from "@/lib/audit"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp01Icon,
  ClockIcon,
  Search01Icon,
  MultiplicationSignIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export interface ArchivedCardField {
  label: string
  value: string
  mono?: boolean
}

export interface ArchivedHistoryRef {
  entity: AuditEntity
  recordId: string
  subtitle?: string
}

function ArchivedBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-current" />
      Arquivado
    </span>
  )
}

export function ArchivedCard({
  topLabel,
  statusBadge,
  title,
  subtitle,
  fields,
  archivedAt,
  entityLabel,
  onUnarchive,
  history,
}: {
  topLabel: string
  statusBadge?: React.ReactNode
  title: string
  subtitle?: string
  fields?: ArchivedCardField[]
  archivedAt: string
  entityLabel: string
  onUnarchive: () => Promise<unknown>
  history?: ArchivedHistoryRef
}) {
  const [pending, setPending] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)

  function handleUnarchive() {
    setPending(true)
    Promise.resolve(onUnarchive())
      .then(() => toast.success(`${capitalize(entityLabel)} desarquivado.`))
      .catch((err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `Não foi possível desarquivar o ${entityLabel}.`
        )
      )
      .finally(() => setPending(false))
  }

  return (
    <>
      <div className="group flex flex-col gap-3 rounded-xl border bg-linear-to-b from-muted to-card p-5 transition-colors hover:border-ring/40">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {topLabel}
          </span>
          {statusBadge ?? <ArchivedBadge />}
        </div>

        <div className="space-y-0.5">
          <h3 className="line-clamp-2 leading-snug font-medium">{title}</h3>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {fields?.length ? (
          <dl className="space-y-2 border-t pt-3">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd
                  className={cn(
                    "text-sm font-medium",
                    f.mono && "font-mono tabular-nums"
                  )}
                >
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="relative mt-auto flex min-h-8 items-center pt-1">
          <span className="text-xs whitespace-nowrap text-muted-foreground transition-opacity group-hover:opacity-0">
            Arquivado em {formatDate(archivedAt)}
          </span>
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [&_button]:pointer-events-none group-hover:[&_button]:pointer-events-auto focus-within:[&_button]:pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs"
              onClick={handleUnarchive}
              disabled={pending}
            >
              <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
              Desarquivar
            </Button>
            {history ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs text-info hover:bg-info/10 hover:text-info"
                onClick={() => setHistoryOpen(true)}
              >
                <HugeiconsIcon icon={ClockIcon} strokeWidth={2} />
                Ver histórico
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {history ? (
        <HistoryDrawer
          entity={history.entity}
          recordId={history.recordId}
          entityLabel={entityLabel}
          subtitle={history.subtitle}
          open={historyOpen}
          onOpenChange={setHistoryOpen}
        />
      ) : null}
    </>
  )
}

const GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"

/** Grid (3 colunas) de arquivados com busca + paginação client-side. */
export function ArchivedCardGrid<T>({
  items,
  isLoading,
  isError,
  error,
  emptyMessage,
  searchPlaceholder = "Buscar arquivados...",
  getSearchText,
  renderCard,
  pageSize = 9,
}: {
  items: T[]
  isLoading?: boolean
  isError?: boolean
  error?: unknown
  emptyMessage: string
  searchPlaceholder?: string
  getSearchText: (item: T) => string
  renderCard: (item: T) => React.ReactNode
  pageSize?: number
}) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => getSearchText(it).toLowerCase().includes(q))
  }, [items, search, getSearchText])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  React.useEffect(() => {
    setPage(1)
  }, [search])

  return (
    <div className="flex flex-col gap-4">
      <InputGroup className="h-10 w-80 rounded-lg border-transparent bg-card shadow-none">
        <InputGroupAddon align="inline-start">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search.length > 0 ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Limpar busca"
              title="Limpar busca"
              size="icon-xs"
              onClick={() => setSearch("")}
            >
              <HugeiconsIcon icon={MultiplicationSignIcon} strokeWidth={2} />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>

      {isLoading ? (
        <div className={GRID}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Erro ao carregar."}
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {search ? "Nenhum resultado encontrado." : emptyMessage}
        </p>
      ) : (
        <>
          <div className={GRID}>{pageItems.map(renderCard)}</div>
          <div className="flex items-center justify-between gap-2 border-t pt-3 text-sm">
            <span className="text-muted-foreground">
              {start + 1}–{Math.min(start + pageSize, filtered.length)} de{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                Anterior
              </Button>
              <span className="text-xs tabular-nums text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
