"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartCard } from "@/components/dashboard/chart-card"
import type { SortableRenderProps } from "@/components/dnd/sortable-grid"
import { nonContinuousChartConfig } from "@/components/dashboard/chart-palette"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatBRL, formatCompactBRL } from "@/lib/format"
import type { DashboardResponse } from "@/lib/dashboard"

type NonContinuous = NonNullable<DashboardResponse["nonContinuous"]>

/**
 * Não continuados por exercício. **Empilhado** de propósito: pago e saldo são
 * as duas partes do que foi empenhado, então a altura total da coluna é o
 * empenhado do ano — parte-e-todo, não comparação lado a lado.
 */
export function NonContinuousChart({
  nonContinuous,
  handle,
}: {
  nonContinuous: NonContinuous
  handle?: SortableRenderProps["handle"]
}) {
  const data = React.useMemo(
    () =>
      nonContinuous.byYear.map((item) => ({
        label: String(item.year),
        paid: item.paid,
        balance: item.balance,
        committed: item.committed,
      })),
    [nonContinuous]
  )

  const total = data.reduce((sum, item) => sum + item.committed, 0)

  return (
    <ChartCard
      handle={handle}
      title="Não continuados por exercício"
      subtitle={`${nonContinuous.creditorCount} credor${nonContinuous.creditorCount === 1 ? "" : "es"} — a coluna inteira é o empenhado do ano`}
      isEmpty={total === 0}
      emptyMessage="Nenhum empenho de não continuado nos últimos exercícios."
    >
      <ChartContainer config={nonContinuousChartConfig} className="aspect-auto min-h-56 w-full grow">
        <BarChart data={data} margin={{ left: 4, right: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(value: number) => formatCompactBRL(value)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <span className="flex w-full justify-between gap-3">
                    <span className="text-muted-foreground">
                      {nonContinuousChartConfig[
                        name as keyof typeof nonContinuousChartConfig
                      ]?.label ?? name}
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
          {/* stackId comum + 2px de vão: os segmentos se separam pelo espaço,
              nunca por um contorno. */}
          <Bar
            dataKey="paid"
            stackId="nc"
            fill="var(--color-paid)"
            barSize={24}
          />
          <Bar
            dataKey="balance"
            stackId="nc"
            fill="var(--color-balance)"
            barSize={24}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
