"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import {
  ContractStatusBadge,
  STATUS_LABEL,
} from "@/components/contracts/contract-status-badge"
import { parseBRL } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { BudgetLine } from "@/lib/budget"

const CONTRACT_URL = "/dashboard/contratos/continuados/relacao-contratos"

/** parseBRL descarta o sinal — glosas e economizado podem ser negativos. */
const signedBRL = (value: string) =>
  (value.includes("-") ? -1 : 1) * parseBRL(value)

/** Coluna de dinheiro: alinhada à direita, monoespaçada, ordenada pelo número. */
function moneyColumn(
  id: keyof BudgetLine,
  title: string,
  options: {
    size?: number
    /** Classe extra por linha (destaques da RF-GO05/GO06). */
    toneOf?: (line: BudgetLine) => string | undefined
    /** Explica o destaque para quem passa o mouse. */
    titleOf?: (line: BudgetLine) => string | undefined
  } = {}
): ColumnDef<BudgetLine> {
  return {
    accessorKey: id,
    id,
    header: ({ column }) => (
      <DataGridColumnHeader title={title} column={column} />
    ),
    sortingFn: (a, b) =>
      signedBRL(a.original[id] as string) - signedBRL(b.original[id] as string),
    cell: ({ row }) => (
      <span
        title={options.titleOf?.(row.original)}
        className={cn(
          "block text-right font-mono tabular-nums",
          options.toneOf?.(row.original)
        )}
      >
        {row.original[id]}
      </span>
    ),
    size: options.size ?? 150,
  }
}

export function budgetColumns(): ColumnDef<BudgetLine>[] {
  return [
    {
      accessorKey: "contractNumber",
      id: "contractNumber",
      header: ({ column }) => (
        <DataGridColumnHeader title="Contrato" column={column} />
      ),
      // RF-GO07 — o número leva ao contrato; link explícito em vez de clique
      // na linha inteira, que não anuncia para onde vai.
      cell: ({ row }) => (
        <Link
          href={`${CONTRACT_URL}/${row.original.contractId}`}
          className="font-mono font-medium tabular-nums underline-offset-4 hover:underline"
        >
          {row.original.contractNumber}
        </Link>
      ),
      size: 120,
    },
    {
      // Filtra pelo rótulo em português — é o que a toolbar lista.
      id: "status",
      accessorFn: (row) => STATUS_LABEL[row.status],
      header: ({ column }) => (
        <DataGridColumnHeader title="Status" column={column} />
      ),
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      cell: ({ row }) => <ContractStatusBadge status={row.original.status} />,
      size: 110,
    },
    {
      accessorKey: "company",
      id: "company",
      header: ({ column }) => (
        <DataGridColumnHeader title="Contratada" column={column} />
      ),
      size: 220,
    },
    moneyColumn("annualCost", "Custo Anual", { size: 160 }),
    moneyColumn("requiredBudget", "Orçamento Necessário", { size: 190 }),
    moneyColumn("releasedBudget", "Orçamento Liberado", {
      size: 180,
      // RF-GO06 — contrato sub-empenhado: o que foi liberado não cobre o ano.
      toneOf: (line) =>
        signedBRL(line.releasedBudget) < signedBRL(line.annualCost)
          ? "text-warning"
          : undefined,
      titleOf: (line) =>
        signedBRL(line.releasedBudget) < signedBRL(line.annualCost)
          ? "Orçamento liberado menor que o custo anual do contrato."
          : undefined,
    }),
    moneyColumn("commitmentsBalance", "Saldo dos Empenhos", { size: 180 }),
    moneyColumn("disallowances", "Glosas", {
      size: 160,
      // RF-GO05 — glosa negativa: o saldo não cobre o que ainda falta gastar.
      toneOf: (line) =>
        signedBRL(line.disallowances) < 0 ? "text-destructive" : undefined,
      titleOf: (line) =>
        signedBRL(line.disallowances) < 0
          ? "Saldo dos empenhos abaixo do orçamento ainda necessário."
          : undefined,
    }),
    moneyColumn("totalSaved", "Total Economizado", { size: 170 }),
    {
      id: "companyFilter",
      accessorFn: (row) => row.company,
      filterFn: (row, id, value: string[]) =>
        !value?.length || value.includes(String(row.getValue(id))),
      meta: { filterOnly: true },
    },
    {
      // As duas leituras que a tela existe para dar: contrato sub-empenhado
      // (RF-GO06) e glosa negativa (RF-GO05).
      id: "alerts",
      accessorFn: (row) => {
        if (signedBRL(row.disallowances) < 0) return "Glosa negativa"
        if (signedBRL(row.releasedBudget) < signedBRL(row.annualCost))
          return "Sub-empenhado"
        return "Sem alerta"
      },
      filterFn: (row, id, value: string[]) =>
        !value?.length || value.includes(String(row.getValue(id))),
      meta: { filterOnly: true },
    },
  ]
}
