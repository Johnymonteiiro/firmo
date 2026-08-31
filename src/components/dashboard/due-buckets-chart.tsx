"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

import { ChartCard } from "@/components/dashboard/chart-card"
import type { SortableRenderProps } from "@/components/dnd/sortable-grid"
import { DUE_RAMP, dueChartConfig } from "@/components/dashboard/chart-palette"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ContractsBlock } from "@/lib/dashboard"

/**
 * Contratos por faixa de vencimento. As faixas têm ordem natural, então a cor
 * é uma **rampa de uma matiz só** — mais perto do vencimento, mais escuro — e
 * não cores de identidade, que sugeririam categorias sem relação.
 *
 * Série única: sem legenda; o rótulo de cada faixa está no eixo.
 */
export function DueBucketsChart({
  byDueBucket,
  handle,
}: {
  byDueBucket: ContractsBlock["byDueBucket"]
  handle?: SortableRenderProps["handle"]
}) {
  const data = React.useMemo(
    () => [
      { label: "até 30d", contratos: byDueBucket.ate30 },
      { label: "31–60d", contratos: byDueBucket.ate60 },
      { label: "61–90d", contratos: byDueBucket.ate90 },
      { label: "+90d", contratos: byDueBucket.acima90 },
    ],
    [byDueBucket]
  )

  const total = data.reduce((sum, item) => sum + item.contratos, 0)

  return (
    <ChartCard
      handle={handle}
      title="Vencimentos por faixa"
      subtitle="Contratos por prazo restante — encerrados e expirados ficam de fora"
      isEmpty={total === 0}
      emptyMessage="Nenhum contrato a vencer."
    >
      <ChartContainer config={dueChartConfig} className="aspect-auto min-h-56 w-full grow">
        <BarChart data={data} margin={{ left: 4, right: 8, top: 16 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={32}
            allowDecimals={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) =>
                  `${Number(value)} contrato${Number(value) === 1 ? "" : "s"}`
                }
              />
            }
          />
          <Bar dataKey="contratos" barSize={24} radius={[4, 4, 0, 0]}>
            {data.map((item, index) => (
              <Cell key={item.label} fill={DUE_RAMP[index]} />
            ))}
            {/* Contagem é número pequeno e inteiro: cabe na ponta da coluna,
                e evita o eixo Y precisar ser lido a cada barra. */}
            <LabelList
              dataKey="contratos"
              position="top"
              className="fill-muted-foreground text-xs"
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
