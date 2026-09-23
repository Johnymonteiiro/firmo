"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"

import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { actionsColumn } from "@/components/data-table/columns"
import { BillingFormDialog } from "@/components/billings/billing-form-dialog"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  billingDetailUrl,
  formatPeriod,
  useArchiveBilling,
  type Billing,
} from "@/lib/billings"
import { PERMISSIONS, usePermissions } from "@/lib/permissions"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

export interface BillingColumnsOptions {
  /** contractId -> número do contrato (ex.: "2333/2026"). */
  getContractNumber: (contractId: string) => string
}

const dash = (v: string | null) => v ?? "—"

/** Filtro multi-seleção (valor = array de strings). */
function inArrayFilter(
  row: { getValue: (id: string) => unknown },
  id: string,
  value: string[]
) {
  return !value?.length || value.includes(row.getValue(id) as string)
}

export function billingColumns({
  getContractNumber,
}: BillingColumnsOptions): ColumnDef<Billing>[] {
  return [
    {
      id: "contract",
      accessorFn: (row) => getContractNumber(row.contractId),
      header: ({ column }) => (
        <DataGridColumnHeader title="Contrato" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium tabular-nums">
          {getContractNumber(row.original.contractId)}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "contractedCompany",
      id: "contractedCompany",
      header: ({ column }) => (
        <DataGridColumnHeader title="Contratada" column={column} />
      ),
      size: 200,
    },
    {
      accessorKey: "totalBilledAmount",
      id: "totalBilledAmount",
      header: ({ column }) => (
        <DataGridColumnHeader title="Valor Faturado (R$)" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block text-right font-mono tabular-nums">
          {row.original.totalBilledAmount}
        </span>
      ),
      size: 150,
    },
    {
      // Ordena e busca pela primeira SNE — a que fica visível na linha.
      accessorFn: (row) => row.snes[0]?.sne ?? "",
      id: "snes",
      header: ({ column }) => (
        <DataGridColumnHeader title="SNE Desconta" column={column} />
      ),
      cell: ({ row }) => (
        <ListDropdownCell
          title={
            row.original.snes.length === 1
              ? "1 SNE descontada"
              : `${row.original.snes.length} SNEs descontadas`
          }
          items={row.original.snes.map((item) => ({
            key: item.sne,
            primary: item.sne,
            secondary: item.billedAmount,
          }))}
          footer={{ label: "Total", value: row.original.totalBilledAmount }}
        />
      ),
      size: 170,
    },
    {
      accessorFn: (row) => row.fiscalDocuments[0] ?? "",
      id: "fiscalDocuments",
      header: ({ column }) => (
        <DataGridColumnHeader title="Documento Fiscal" column={column} />
      ),
      cell: ({ row }) => (
        <ListDropdownCell
          title={
            row.original.fiscalDocuments.length === 1
              ? "1 documento fiscal"
              : `${row.original.fiscalDocuments.length} documentos fiscais`
          }
          items={row.original.fiscalDocuments.map((number) => ({
            key: number,
            primary: number,
          }))}
        />
      ),
      size: 170,
    },
    {
      accessorKey: "paymentRequestNumber",
      id: "paymentRequestNumber",
      header: ({ column }) => (
        <DataGridColumnHeader title="Solicitação Pagamento" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {dash(row.original.paymentRequestNumber)}
        </span>
      ),
      size: 160,
    },
    {
      accessorKey: "period",
      id: "period",
      header: ({ column }) => (
        <DataGridColumnHeader title="Competência (mm/aaaa)" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {formatPeriod(row.original.period)}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "paymentProcessNumber",
      id: "paymentProcessNumber",
      header: ({ column }) => (
        <DataGridColumnHeader title="Processo de Pagamento" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums">
          {dash(row.original.paymentProcessNumber)}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "notes",
      id: "notes",
      header: ({ column }) => (
        <DataGridColumnHeader title="Observação" column={column} />
      ),
      cell: ({ row }) => (
        <span
          className="block max-w-65 truncate"
          title={row.original.notes ?? undefined}
        >
          {dash(row.original.notes)}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "savedAmount",
      id: "savedAmount",
      header: ({ column }) => (
        <DataGridColumnHeader title="Valor Economizado" column={column} />
      ),
      cell: ({ row }) => (
        <span className="block text-right font-mono tabular-nums">
          {dash(row.original.savedAmount)}
        </span>
      ),
      size: 150,
    },
    {
      id: "contractFilter",
      accessorFn: (row) => getContractNumber(row.contractId),
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    {
      id: "companyFilter",
      accessorFn: (row) => row.contractedCompany,
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    {
      // O ano da competência: filtrar "2026" é mais útil que escolher os doze
      // meses um a um, e o filtro de competência já cobre o mês exato.
      id: "periodYear",
      accessorFn: (row) => row.period.slice(0, 4),
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    {
      id: "periodFilter",
      accessorFn: (row) => formatPeriod(row.period),
      filterFn: inArrayFilter,
      meta: { filterOnly: true },
    },
    actionsColumn(({ row }) => <BillingActionsCell billing={row.original} />),
  ]
}

interface DropdownListItem {
  key: string
  primary: string
  secondary?: string
}

/**
 * Primeiro item na linha, `+N` quando há mais, e o dropdown abre a lista
 * inteira — o mesmo desenho da coluna "SNE Reforço" de empenhos. Aqui é só
 * leitura: editar a lista é pelo "Editar" do faturamento. Lista vazia mostra
 * só o traço, sem nada para abrir.
 */
function ListDropdownCell({
  title,
  items,
  footer,
}: {
  title: string
  items: DropdownListItem[]
  footer?: { label: string; value: string }
}) {
  const [first, ...rest] = items

  if (!first) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-sm px-1 py-0.5 font-mono tabular-nums hover:bg-accent"
        >
          {first.primary}
          {rest.length > 0 ? (
            <Badge variant="secondary" className="px-1.5 py-0 font-sans">
              +{rest.length}
            </Badge>
          ) : null}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="size-3.5 opacity-50"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem
            key={item.key}
            onSelect={(event) => event.preventDefault()}
            className="flex items-center justify-between gap-3"
          >
            <span className="font-mono tabular-nums">{item.primary}</span>
            {item.secondary ? (
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {item.secondary}
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
        {footer ? (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between gap-3 px-2 py-1.5 text-sm font-medium">
              <span>{footer.label}</span>
              <span className="font-mono tabular-nums">{footer.value}</span>
            </div>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BillingActionsCell({ billing }: { billing: Billing }) {
  const router = useRouter()
  const archive = useArchiveBilling()
  const [editOpen, setEditOpen] = React.useState(false)
  const { can } = usePermissions()

  return (
    <>
      <DataTableRowActions
        entityLabel="faturamento"
        onDetails={() => router.push(billingDetailUrl(billing.billingId))}
        onEdit={
          can(PERMISSIONS.faturamentosEditar)
            ? () => setEditOpen(true)
            : undefined
        }
        history={
          can(PERMISSIONS.auditoriaVisualizar)
            ? {
                entity: "billing",
                recordId: billing.billingId,
                subtitle: `Competência ${formatPeriod(billing.period)} · ${billing.contractedCompany}`,
              }
            : undefined
        }
        onArchive={
          can(PERMISSIONS.faturamentosArquivar)
            ? () => archive.mutateAsync(billing.billingId)
            : undefined
        }
      />
      {/* Montado sob demanda — evita instanciar um form por linha da tabela. */}
      {editOpen ? (
        <BillingFormDialog
          billing={billing}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </>
  )
}
