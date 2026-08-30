"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CommitmentStatusBadge } from "@/components/commitments/commitment-status-badge"
import {
  ContractStatusBadge,
  getDisplayStatus,
} from "@/components/contracts/contract-status-badge"
import { HistoryDrawer } from "@/components/history/history-drawer"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import { UserProfileBadges } from "@/components/users/user-profile-badge"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import { useSession } from "@/lib/auth"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"
import { useUserCommitments, type Commitment } from "@/lib/commitments"
import { useUserContracts, type Contract } from "@/lib/contracts"
import { formatDate } from "@/lib/format"
import { useUser } from "@/lib/users"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon, ClockIcon } from "@hugeicons/core-free-icons"

const TODOS_URL = "/dashboard/usuarios/todos"
const CONTRACT_URL = "/dashboard/contratos/continuados/relacao-contratos"

/** Teto de uma página só — igual ao do UserPicker. */
const PAGE_SIZE = 100

type Tab = "contracts" | "commitments"

export function UserDetail({ userId }: { userId: string }) {
  const { data: user, isLoading, isError, error } = useUser(userId)
  const { data: session } = useSession()
  const { can } = usePermissions()
  const contracts = useUserContracts(userId, PAGE_SIZE)
  const commitments = useUserCommitments(userId, PAGE_SIZE)
  const [tab, setTab] = React.useState<Tab>("contracts")
  const [editOpen, setEditOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)

  // RN-U06: quem tem `usuarios:editar` edita qualquer um; os demais, só a si
  // mesmos e sem tocar em perfil. E-mail e status não são editáveis aqui.
  const canEditOthers = can(PERMISSIONS.usuariosEditar)
  const isSelf = session?.userId === userId
  const canEditSelf = isSelf && can(PERMISSIONS.usuariosEditarProprio)
  const canEdit = canEditOthers || canEditSelf

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href={TODOS_URL}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Usuários
        </Link>
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Usuário não encontrado."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={TODOS_URL} className="hover:text-foreground">
          Usuários
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{user.name}</span>
      </nav>

      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.name}
            </h1>
            <UserProfileBadges profiles={user.profiles} />
            <UserStatusBadge status={user.status} />
            {isSelf ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                você
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {canEdit ? (
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

      {/* resumo */}
      <div className="grid grid-cols-1 divide-y rounded-xl border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <Cell label="E-mail" value={user.email} />
        <Cell label="Cadastrado em" value={formatDate(user.createdAt)} mono />
        <Cell
          label="Contratos sob gestão"
          value={countLabel(contracts.data?.total, contracts.isLoading)}
          mono
        />
        <Cell
          label="Empenhos vinculados"
          value={countLabel(commitments.data?.total, commitments.isLoading)}
          mono
        />
      </div>

      {/* abas */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex w-fit gap-1 rounded-lg border bg-card p-1">
          <TabButton
            active={tab === "contracts"}
            onClick={() => setTab("contracts")}
          >
            Contratos
          </TabButton>
          <TabButton
            active={tab === "commitments"}
            onClick={() => setTab("commitments")}
          >
            Empenhos
          </TabButton>
        </div>

        {tab === "contracts" ? (
          <ContractsTab
            userId={userId}
            query={contracts}
            userName={user.name}
          />
        ) : (
          <CommitmentsTab
            query={commitments}
            contracts={contracts.data?.data ?? []}
          />
        )}
      </div>

      <EditUserDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        canEditProfile={canEditOthers}
        self={!canEditOthers && isSelf}
      />
      <HistoryDrawer
        entity="user"
        recordId={user.userId}
        entityLabel="usuário"
        subtitle={`${user.name} · ${user.email}`}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </div>
  )
}

type ListQuery<T> = {
  data?: { data: T[]; total: number }
  isLoading: boolean
  isError: boolean
  error: unknown
}

function ContractsTab({
  userId,
  query,
  userName,
}: {
  userId: string
  query: ListQuery<Contract>
  userName: string
}) {
  if (query.isLoading) return <Skeleton className="h-48 w-full" />
  if (query.isError) return <ErrorLine error={query.error} />

  const rows = query.data?.data ?? []
  if (rows.length === 0) {
    return (
      <EmptyState>
        Nenhum contrato vinculado a {userName}. Contratos anteriores ao vínculo
        com usuário guardam apenas o nome em texto e não aparecem aqui.
      </EmptyState>
    )
  }

  return (
    <Panel total={query.data?.total ?? rows.length} label="contrato(s)">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contrato</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="text-right">Valor mensal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((contract) => (
            <TableRow key={contract.contractId}>
              <TableCell className="font-mono tabular-nums">
                <Link
                  href={`${CONTRACT_URL}/${contract.contractId}`}
                  className="hover:underline"
                >
                  {contract.contractNumber}
                </Link>
              </TableCell>
              <TableCell className="max-w-56 truncate">
                {contract.company}
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {rolesOf(contract, userId).join(" · ")}
                </span>
              </TableCell>
              <TableCell>
                <ContractStatusBadge status={getDisplayStatus(contract)} />
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {formatDate(contract.expiresAt)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {contract.monthlyValue}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  )
}

function CommitmentsTab({
  query,
  contracts,
}: {
  query: ListQuery<Commitment>
  contracts: Contract[]
}) {
  if (query.isLoading) return <Skeleton className="h-48 w-full" />
  if (query.isError) return <ErrorLine error={query.error} />

  const rows = query.data?.data ?? []
  if (rows.length === 0) {
    return (
      <EmptyState>
        Nenhum empenho nos contratos sob responsabilidade deste usuário.
      </EmptyState>
    )
  }

  // O empenho traz só o contractId; o número vem da aba de contratos, que já
  // foi carregada pelo mesmo perfil.
  const numberById = new Map(
    contracts.map((c) => [c.contractId, c.contractNumber])
  )

  return (
    <Panel total={query.data?.total ?? rows.length} label="empenho(s)">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SNE</TableHead>
            <TableHead>Contrato</TableHead>
            <TableHead>Data SNE</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor inicial</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((commitment) => (
            <TableRow key={commitment.commitmentId}>
              <TableCell className="font-mono tabular-nums">
                {commitment.sne}
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                <Link
                  href={`${CONTRACT_URL}/${commitment.contractId}`}
                  className="hover:underline"
                >
                  {numberById.get(commitment.contractId) ?? "—"}
                </Link>
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {formatDate(commitment.sneDate)}
              </TableCell>
              <TableCell>
                <CommitmentStatusBadge status={commitment.status} />
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {commitment.initialValue}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {commitment.currentBalance}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  )
}

/** Papéis do usuário naquele contrato — pode ocupar mais de um. */
function rolesOf(contract: Contract, userId: string): string[] {
  const roles: string[] = []
  if (contract.managers.some((m) => m.userId === userId)) roles.push("Gestor")
  if (contract.adminFiscals.some((f) => f.userId === userId)) {
    roles.push("Fiscal Adm")
  }
  if (contract.techFiscals.some((f) => f.userId === userId)) {
    roles.push("Fiscal Téc")
  }
  return roles.length > 0 ? roles : ["—"]
}

function countLabel(total: number | undefined, isLoading: boolean): string {
  if (isLoading) return "…"
  return String(total ?? 0)
}

function Panel({
  total,
  label,
  children,
}: {
  total: number
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-xl border bg-card">{children}</div>
      {total > PAGE_SIZE ? (
        <p className="text-xs text-muted-foreground">
          Mostrando os {PAGE_SIZE} primeiros de {total} {label}.
        </p>
      ) : null}
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

function ErrorLine({ error }: { error: unknown }) {
  return (
    <p className="text-sm text-destructive">
      {error instanceof Error ? error.message : "Falha ao carregar."}
    </p>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
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
      <div className={cn("mt-1 font-medium", mono && "font-mono tabular-nums")}>
        {value}
      </div>
    </div>
  )
}
