"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { budgetColumns } from "@/components/budget/budget-columns"
import { BudgetKpis } from "@/components/budget/budget-kpis"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABEL } from "@/components/contracts/contract-status-badge"
import { budgetYearOptions, useBudgetOverview } from "@/lib/budget"
import { csvDecimal } from "@/lib/csv"

/** Data/hora do cálculo (RF-GO09) — os números são derivados a cada request. */
function formatCalculatedAt(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
}

export function BudgetOverview() {
  const years = React.useMemo(() => budgetYearOptions(), [])
  const [year, setYear] = React.useState(() => new Date().getFullYear())

  const { data, isLoading, isError, error } = useBudgetOverview(year)
  const columns = React.useMemo(() => budgetColumns(), [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="budget-year" className="text-muted-foreground">
            Exercício
          </Label>
          <Select
            value={String(year)}
            onValueChange={(value) => setYear(Number(value))}
          >
            <SelectTrigger id="budget-year" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data ? (
          <p className="text-xs text-muted-foreground">
            Números calculados em {formatCalculatedAt(data.calculatedAt)} — o
            relatório é derivado de contratos, empenhos e faturamentos.
          </p>
        ) : null}
      </div>

      <BudgetKpis
        totals={data?.totals}
        contracts={data?.total ?? 0}
        year={year}
        isLoading={isLoading}
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getRowId={(line) => line.contractId}
        searchPlaceholder="Buscar por contrato ou contratada..."
        filters={[
          { columnId: "status", title: "Status" },
          { columnId: "companyFilter", title: "Contratada" },
          {
            columnId: "alerts",
            title: "Alertas",
            order: ["Glosa negativa", "Sub-empenhado", "Sem alerta"],
          },
        ]}
        exportCsv={{
          // O ano vai no nome do arquivo: dois exercícios exportados no mesmo
          // dia não podem cair com o mesmo nome na pasta de downloads.
          filename: `gestao-orcamentaria-${year}`,
          headers: [
            "Contrato",
            "Status",
            "Contratada",
            "Custo anual (R$)",
            "Orçamento necessário (R$)",
            "Orçamento liberado (R$)",
            "Saldo dos empenhos (R$)",
            "Glosas (R$)",
            "Total economizado (R$)",
          ],
          toRow: (line) => [
            line.contractNumber,
            STATUS_LABEL[line.status],
            line.company,
            csvDecimal(line.annualCost),
            csvDecimal(line.requiredBudget),
            csvDecimal(line.releasedBudget),
            csvDecimal(line.commitmentsBalance),
            csvDecimal(line.disallowances),
            csvDecimal(line.totalSaved),
          ],
        }}
        emptyMessage={
          isError
            ? error instanceof Error
              ? error.message
              : "Erro ao carregar a Gestão Orçamentária."
            : `Nenhum contrato vigente em ${year}.`
        }
      />
    </div>
  )
}
