"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ContractStatusBadge,
  getDisplayStatus,
} from "@/components/contracts/contract-status-badge"
import { EditContractDialog } from "@/components/contracts/edit-contract-dialog"
import { HistoryDrawer } from "@/components/history/history-drawer"
import { useContract } from "@/lib/contracts"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon, ClockIcon } from "@hugeicons/core-free-icons"

const TODOS_URL = "/dashboard/contratos/continuados/relacao-contratos/todos"

export function ContractDetail({ contractId }: { contractId: string }) {
  const { data: contract, isLoading, isError, error } = useContract(contractId)
  const [editOpen, setEditOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)

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

  if (isError || !contract) {
    return (
      <div className="flex flex-col gap-4">
        <Link href={TODOS_URL} className="text-sm text-muted-foreground hover:text-foreground">
          ← Contratos
        </Link>
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Contrato não encontrado."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={TODOS_URL} className="hover:text-foreground">
          Contratos
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">
          {contract.contractNumber}
        </span>
      </nav>

      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Contrato {contract.contractNumber}
            </h1>
            <ContractStatusBadge status={getDisplayStatus(contract)} />
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {contract.subject}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
            Editar
          </Button>
          <Button onClick={() => setHistoryOpen(true)}>
            <HugeiconsIcon icon={ClockIcon} strokeWidth={2} />
            Ver histórico
          </Button>
        </div>
      </div>

      {/* resumo */}
      <div className="grid grid-cols-1 divide-y rounded-xl border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <Cell label="Fornecedor" value={contract.company} />
        <Cell
          label="Vigência"
          value={`${formatDate(contract.startDate)} — ${formatDate(contract.expiresAt)}`}
          mono
        />
        <Cell label="Valor mensal" value={contract.monthlyValue} mono />
        <Cell label="Gestor" value={contract.manager} />
      </div>

      {/* objeto + dados gerais */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Objeto">
          <p className="text-sm leading-relaxed">{contract.subject}</p>
        </Panel>

        <Panel title="Dados gerais">
          <dl className="space-y-2.5 text-sm">
            <Row label="Processo" value={contract.processNumber} mono />
            <Row
              label="Início da vigência"
              value={formatDate(contract.startDate)}
              mono
            />
            <Row
              label="Data de vencimento"
              value={formatDate(contract.expiresAt)}
              mono
            />
            <Row
              label="Dias restantes"
              value={String(contract.daysRemaining)}
              mono
            />
            <Row label="Fiscal Adm" value={contract.adminFiscal} />
            <Row label="Fiscais Técnicos" value={contract.techFiscals} />
            <Row
              label="Ocorreu reajuste"
              value={contract.hasAdjustment === "SIM" ? "Sim" : "Não"}
            />
            <Row
              label="Valor após reajuste"
              value={contract.adjustedMonthlyValue ?? "—"}
              mono
            />
            <Row
              label="Mês/Ano reajuste"
              value={contract.adjustmentMonthYear ?? "—"}
              mono
            />
            <Row label="Observação" value={contract.notes ?? "—"} />
          </dl>
        </Panel>
      </div>

      <EditContractDialog
        contract={contract}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <HistoryDrawer
        entity="contract"
        recordId={contract.contractId}
        entityLabel="contrato"
        subtitle={`Nº ${contract.contractNumber} · ${contract.company}`}
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
  value: string
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
      <p className="mb-3 text-2xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">
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
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
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
