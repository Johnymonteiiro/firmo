"use client"

import * as React from "react"
import Link from "next/link"

import { BillingFormDialog } from "@/components/billings/billing-form-dialog"
import { HistoryDrawer } from "@/components/history/history-drawer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPeriod, useBilling } from "@/lib/billings"
import { useContract } from "@/lib/contracts"
import { formatDate } from "@/lib/format"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ClockIcon, PencilEdit02Icon } from "@hugeicons/core-free-icons"

const TODOS_URL = "/dashboard/faturamento/continuados/todos"

const contractDetailUrl = (contractId: string) =>
  `/dashboard/contratos/continuados/relacao-contratos/${contractId}`

export function BillingDetail({ billingId }: { billingId: string }) {
  const { data: billing, isLoading, isError, error } = useBilling(billingId)
  const { data: contract } = useContract(billing?.contractId ?? null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const { can } = usePermissions()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !billing) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href={TODOS_URL}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Faturamentos
        </Link>
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Faturamento não encontrado."}
        </p>
      </div>
    )
  }

  const period = formatPeriod(billing.period)
  const contractNumber = contract?.contractNumber ?? "—"

  return (
    <div className="flex flex-col gap-5">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={TODOS_URL} className="hover:text-foreground">
          Faturamentos
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">
          Competência {period}
        </span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            Faturamento {period}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Contrato {contractNumber} · {billing.contractedCompany}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {can(PERMISSIONS.faturamentosEditar) ? (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
              Editar
            </Button>
          ) : null}
          {can(PERMISSIONS.auditoriaVisualizar) ? (
            <Button onClick={() => setHistoryOpen(true)}>
              <HugeiconsIcon icon={ClockIcon} strokeWidth={2} />
              Ver histórico
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y rounded-xl border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <Cell
          label="Contrato"
          value={
            <Link
              href={contractDetailUrl(billing.contractId)}
              className="underline-offset-4 hover:underline"
            >
              {contractNumber}
            </Link>
          }
          mono
        />
        <Cell label="Competência" value={period} mono />
        <Cell label="Valor faturado" value={billing.totalBilledAmount} mono />
        <Cell
          label="Valor economizado"
          value={billing.savedAmount ?? "—"}
          mono
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="SNEs descontadas">
          {billing.snes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma SNE descontada.
            </p>
          ) : (
            <dl className="space-y-2.5 text-sm">
              {billing.snes.map((item) => (
                <Row
                  key={item.sne}
                  label={item.sne}
                  value={item.billedAmount}
                  mono
                  monoLabel
                />
              ))}
              <div className="border-t pt-2.5">
                <Row label="Total" value={billing.totalBilledAmount} mono />
              </div>
            </dl>
          )}
        </Panel>

        <Panel title="Documentos fiscais">
          {billing.fiscalDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum documento fiscal informado.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {billing.fiscalDocuments.map((number) => (
                <li
                  key={number}
                  className="rounded-md border bg-muted/40 px-2 py-1 font-mono text-sm tabular-nums"
                >
                  {number}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Pagamento">
          <dl className="space-y-2.5 text-sm">
            <Row
              label="Solicitação de pagamento"
              value={billing.paymentRequestNumber ?? "—"}
              mono
            />
            <Row
              label="Processo de pagamento"
              value={billing.paymentProcessNumber ?? "—"}
              mono
            />
            <Row
              label="Lançado em"
              value={formatDate(billing.createdAt)}
              mono
            />
            <Row
              label="Última alteração"
              value={formatDate(billing.updatedAt)}
              mono
            />
          </dl>
        </Panel>

        <Panel title="Observação">
          <p className="text-sm leading-relaxed">{billing.notes ?? "—"}</p>
        </Panel>
      </div>

      {editOpen ? (
        <BillingFormDialog
          billing={billing}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
      <HistoryDrawer
        entity="billing"
        recordId={billing.billingId}
        entityLabel="faturamento"
        subtitle={`Competência ${period} · ${billing.contractedCompany}`}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </div>
  )
}

function Cell({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn("mt-1 font-medium", mono && "font-mono tabular-nums")}
      >
        {value}
      </div>
    </div>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="mb-3 text-2xs font-semibold tracking-[0.07em] text-muted-foreground uppercase">
        {title}
      </p>
      {children}
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  monoLabel,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
  monoLabel?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt
        className={cn(
          "text-muted-foreground",
          monoLabel && "font-mono tabular-nums"
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "text-right font-medium",
          mono && "font-mono tabular-nums"
        )}
      >
        {value}
      </dd>
    </div>
  )
}
