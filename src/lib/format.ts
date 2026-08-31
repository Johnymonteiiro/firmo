/** Formata uma data ISO para dd/mm/aaaa (pt-BR), tratando valores inválidos. */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

/**
 * Converte uma string em BRL ("R$ 1.234,56") para número (1234.56).
 *
 * O sinal é preservado: valores que podem ser negativos — glosas, valor
 * economizado — chegam como "-R$ 1.542,40", e descartar o "−" invertia o
 * significado de quem lia o número.
 */
export function parseBRL(value: string): number {
  if (!value) return 0
  const negative = value.trimStart().startsWith("-") || value.includes("-R$")
  const normalized = value.replace(/[^\d,]/g, "").replace(",", ".")
  const parsed = Number(normalized) || 0
  return negative ? -parsed : parsed
}

/** Formata um número como moeda BRL ("R$ 1.234,56"). */
export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

/**
 * BRL abreviado para eixos de gráfico ("R$ 1,7 mi"). O valor por extenso não
 * cabe num tick do eixo Y — e ali a ordem de grandeza é o que se lê; o número
 * exato fica no tooltip e na tabela.
 */
export function formatCompactBRL(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""

  const compact = (divisor: number, suffix: string): string => {
    const scaled = abs / divisor
    // Uma casa decimal só abaixo de 10 ("R$ 1,7 mi" mas "R$ 12 mi").
    const digits = scaled < 10 ? 1 : 0
    return `${sign}R$ ${scaled.toLocaleString("pt-BR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })} ${suffix}`
  }

  if (abs >= 1_000_000_000) return compact(1_000_000_000, "bi")
  if (abs >= 1_000_000) return compact(1_000_000, "mi")
  if (abs >= 1_000) return compact(1_000, "mil")
  return formatBRL(value)
}
