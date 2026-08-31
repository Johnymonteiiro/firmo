"use client";

import * as React from "react";
import Link from "next/link";

import {
  ContractStatusBadge,
  DaysRemainingBadge,
} from "@/components/contracts/contract-status-badge";
import { DragHandle } from "@/components/dnd/sortable-grid";
import type { SortableRenderProps } from "@/components/dnd/sortable-grid";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { formatBRL } from "@/lib/format";
import type { DashboardResponse } from "@/lib/dashboard";
import { USER_STATUSES } from "@/lib/users";

const CONTRACT_URL = "/dashboard/contratos/continuados/relacao-contratos";
const COMMITMENTS_URL =
  "/dashboard/contratos/continuados/empenhos-saldos/empenhos/todos";

/**
 * Lista curta do painel. Não usa a `DataTable`: busca, filtros, paginação e
 * exportação são peso morto em cinco linhas — aqui a lista é um atalho para a
 * tela que tem tudo isso.
 */
function ListCard({
  title,
  subtitle,
  href,
  handle,
  isEmpty,
  emptyMessage,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  handle?: SortableRenderProps["handle"];
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full min-w-0 flex-col gap-3 rounded-xl border bg-card p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-1.5">
          {handle ? (
            <DragHandle
              label={`Reordenar ${title}`}
              className="-ml-1.5 shrink-0"
              {...handle}
            />
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-medium">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {href ? (
          <Link
            href={href}
            className="shrink-0 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Ver todos
          </Link>
        ) : null}
      </header>

      {isEmpty ? (
        <p className="flex flex-1 items-center justify-center py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y">{children}</ul>
      )}
    </section>
  );
}

function Row({
  href,
  primary,
  secondary,
  value,
  badge,
}: {
  href?: string;
  primary: string;
  secondary: string;
  value?: string;
  badge?: React.ReactNode;
}) {
  const content = (
    <>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{primary}</span>
        <span className="truncate text-xs text-muted-foreground">
          {secondary}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2.5">
        {value ? (
          <span className="font-mono text-sm tabular-nums">{value}</span>
        ) : null}
        {badge}
      </span>
    </>
  );

  return (
    <li>
      {href ? (
        <Link
          href={href}
          className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted/50"
        >
          {content}
        </Link>
      ) : (
        <div className="flex items-center justify-between gap-3 py-2.5">
          {content}
        </div>
      )}
    </li>
  );
}

export function ExpiringContractsCard({
  contracts,
  handle,
}: {
  contracts: NonNullable<DashboardResponse["contracts"]>;
  handle?: SortableRenderProps["handle"];
}) {
  return (
    <ListCard
      handle={handle}
      title="Contratos a vencer"
      subtitle="Próximos 90 dias, do mais urgente"
      href={`${CONTRACT_URL}/todos`}
      isEmpty={contracts.expiringSoon.length === 0}
      emptyMessage="Nenhum contrato vence nos próximos 90 dias."
    >
      {contracts.expiringSoon.map((item) => (
        <Row
          key={item.contractId}
          href={`${CONTRACT_URL}/${item.contractId}`}
          primary={item.contractNumber}
          secondary={item.company}
          badge={
            <DaysRemainingBadge
              days={item.daysRemaining}
              expired={item.status === "EXPIRADO"}
            />
          }
        />
      ))}
    </ListCard>
  );
}

export function TopContractsCard({
  contracts,
  handle,
}: {
  contracts: NonNullable<DashboardResponse["contracts"]>;
  handle?: SortableRenderProps["handle"];
}) {
  return (
    <ListCard
      handle={handle}
      title="Maiores contratos"
      subtitle="Por valor mensal vigente"
      href={`${CONTRACT_URL}/todos`}
      isEmpty={contracts.topByMonthlyValue.length === 0}
      emptyMessage="Nenhum contrato no exercício."
    >
      {contracts.topByMonthlyValue.map((item) => (
        <Row
          key={item.contractId}
          href={`${CONTRACT_URL}/${item.contractId}`}
          primary={item.contractNumber}
          secondary={item.company}
          value={formatBRL(item.monthlyValue)}
          badge={<ContractStatusBadge status={item.status} />}
        />
      ))}
    </ListCard>
  );
}

export function LowBalanceCard({
  commitments,
  handle,
}: {
  commitments: NonNullable<DashboardResponse["commitments"]>;
  handle?: SortableRenderProps["handle"];
}) {
  return (
    <ListCard
      handle={handle}
      title="Empenhos mais consumidos"
      subtitle="Percentual já faturado do que foi liberado"
      href={COMMITMENTS_URL}
      isEmpty={commitments.lowBalance.length === 0}
      emptyMessage="Nenhum empenho com saldo em aberto."
    >
      {commitments.lowBalance.map((item) => (
        <Row
          key={item.commitmentId}
          href={COMMITMENTS_URL}
          primary={`SNE ${item.sne}`}
          secondary={`${item.contractNumber} · ${item.company}`}
          value={formatBRL(item.balance)}
          badge={
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {Math.round(item.consumedRatio * 100)}% usado
            </span>
          }
        />
      ))}
    </ListCard>
  );
}

export function UsersCard({
  users,
  handle,
}: {
  users: NonNullable<DashboardResponse["users"]>;
  handle?: SortableRenderProps["handle"];
}) {
  return (
    <ListCard
      handle={handle}
      title="Usuários"
      subtitle={`${users.total} cadastrados`}
      href="/dashboard/usuarios/todos"
      isEmpty={users.total === 0}
      emptyMessage="Nenhum usuário cadastrado."
    >
      {USER_STATUSES.map((status) => (
        <Row
          key={status}
          primary={String(users.byStatus[status] ?? 0)}
          secondary="usuários"
          badge={<UserStatusBadge status={status} />}
        />
      ))}
    </ListCard>
  );
}
