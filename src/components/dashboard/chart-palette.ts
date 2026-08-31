import type { ChartConfig } from "@/components/ui/chart"

/**
 * Paleta dos gráficos do painel, num lugar só.
 *
 * `--viz-cat-*` é a família **categórica** (identidade de série), validada
 * para daltonismo e contraste nos dois temas. Ordem fixa, nunca ciclada: uma
 * quarta série vira "Outros".
 *
 * `--chart-1…3` são três tons da mesma matiz — servem de rampa **ordinal**
 * (mais escuro = mais próximo/urgente) e nunca para separar séries.
 */
export const VIZ = {
  cat1: "var(--viz-cat-1)",
  cat2: "var(--viz-cat-2)",
  cat3: "var(--viz-cat-3)",
} as const

/**
 * Rampa ordinal das faixas de vencimento: mais perto do vencimento, mais
 * escuro. Quatro passos da mesma matiz — o quarto é derivado do mais claro
 * contra a superfície do card, para a faixa "+90d" ficar visivelmente a menos
 * carregada. Cinza aqui seria pior: escuro demais, leria como urgência.
 */
export const DUE_RAMP = [
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-1)",
  "color-mix(in oklab, var(--chart-1) 40%, var(--card))",
] as const

export const billingChartConfig = {
  billed: { label: "Faturado", color: VIZ.cat1 },
} satisfies ChartConfig

export const budgetChartConfig = {
  released: { label: "Orçamento liberado", color: VIZ.cat1 },
  balance: { label: "Saldo dos empenhos", color: VIZ.cat3 },
} satisfies ChartConfig

export const dueChartConfig = {
  contratos: { label: "Contratos", color: VIZ.cat1 },
} satisfies ChartConfig

export const nonContinuousChartConfig = {
  paid: { label: "Pago", color: VIZ.cat2 },
  balance: { label: "Saldo a pagar", color: VIZ.cat1 },
} satisfies ChartConfig
