"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartCard } from "@/components/dashboard/chart-card"
import type { SortableRenderProps } from "@/components/dnd/sortable-grid"
import { budgetChartConfig } from "@/components/dashboard/chart-palette"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatBRL, formatCompactBRL } from "@/lib/format"
import type { CommitmentByContract } from "@/lib/dashboard"

const BAR_SIZE = 14

/**
 * Liberado × saldo, por contrato. **Horizontal** porque a categoria é o número
 * do contrato com a empresa — em colunas o rótulo teria de girar.
 *
 * Duas séries, logo legenda obrigatória. Sem número em cada barra: o eixo e o
 * tooltip carregam os valores.
 */
export function BudgetByContractChart({
  byContract,
  handle,
}: {
  byContract: CommitmentByContract[]
  handle?: SortableRenderProps["handle"]
}) {
  const data = React.useMemo(
    () =>
      byContract.map((item) => ({
        ...item,
        label: item.contractNumber,
      })),
    [byContract]
  )

  return (
    <ChartCard
      handle={handle}
      title="Orçamento liberado e saldo por contrato"
      subtitle="Empenhado inicial mais reforços, e o que ainda resta"
      isEmpty={data.length === 0}
      emptyMessage="Nenhum empenho registrado no exercício."
    >
      <ChartContainer
        config={budgetChartConfig}
        className="aspect-auto w-full grow"
        style={{ minHeight: Math.max(200, data.length * 56) }}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 16 }}
          barCategoryGap={12}
          // 2px de superfície entre as barras do par — o vão separa, não um
          // contorno desenhado em volta.
          barGap={2}
        >
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatCompactBRL(value)}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={96}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label, payload) =>
                  `${String(label)} · ${payload?.[0]?.payload?.company ?? ""}`
                }
                formatter={(value, name) => (
                  <span className="flex w-full justify-between gap-3">
                    <span className="text-muted-foreground">
                      {budgetChartConfig[name as keyof typeof budgetChartConfig]
                        ?.label ?? name}
                    </span>
                    <span className="font-mono tabular-nums">
                      {formatBRL(Number(value))}
                    </span>
                  </span>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="released"
            fill="var(--color-released)"
            barSize={BAR_SIZE}
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="balance"
            fill="var(--color-balance)"
            barSize={BAR_SIZE}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
