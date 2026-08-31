"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { ChartCard } from "@/components/dashboard/chart-card"
import type { SortableRenderProps } from "@/components/dnd/sortable-grid"
import { billingChartConfig } from "@/components/dashboard/chart-palette"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatBRL, formatCompactBRL } from "@/lib/format"
import { monthLabel, type MonthlyPoint } from "@/lib/dashboard"

/**
 * Faturamento mês a mês do exercício — série única, então **sem legenda**: o
 * título já diz o que está plotado.
 *
 * Os meses sem lançamento ficam em zero de propósito. "Não houve faturamento
 * em nove meses" é a informação; desenhar só os três meses com dado sugeriria
 * um ano inteiro movimentado.
 */
export function BillingMonthlyChart({
  monthly,
  year,
  handle,
}: {
  monthly: MonthlyPoint[]
  year: number
  handle?: SortableRenderProps["handle"]
}) {
  const data = React.useMemo(
    () =>
      monthly.map((point) => ({
        ...point,
        label: monthLabel(point.month),
      })),
    [monthly]
  )

  const total = data.reduce((sum, point) => sum + point.billed, 0)
  const lastWithValue = [...data].reverse().find((point) => point.billed > 0)

  return (
    <ChartCard
      handle={handle}
      title="Faturamento por competência"
      subtitle={`${formatBRL(total)} faturados em ${year}`}
      isEmpty={total === 0}
      emptyMessage={`Nenhum faturamento lançado em ${year}.`}
    >
      <ChartContainer config={billingChartConfig} className="aspect-auto min-h-56 w-full grow">
        <LineChart data={data} margin={{ left: 4, right: 16, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(value: number) => formatCompactBRL(value)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label, payload) =>
                  `${String(label)} · ${payload?.[0]?.payload?.competence ?? ""}`
                }
                formatter={(value) => formatBRL(Number(value))}
              />
            }
          />
          <Line
            dataKey="billed"
            // `linear`, não `monotone`: a competência é mensal e discreta, e a
            // curva suave desenharia um faturamento a meio caminho de maio que
            // nunca existiu.
            type="linear"
            stroke="var(--color-billed)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            // Marcador com anel na cor da superfície: é o que mantém o ponto
            // legível onde a linha passa por baixo dele.
            dot={{ r: 4, fill: "var(--color-billed)", stroke: "var(--card)", strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: "var(--card)", strokeWidth: 2 }}
          />
        </LineChart>
      </ChartContainer>

      {lastWithValue ? (
        <p className="text-xs text-muted-foreground">
          Último lançamento: {formatBRL(lastWithValue.billed)} em{" "}
          {lastWithValue.competence}.
        </p>
      ) : null}
    </ChartCard>
  )
}
