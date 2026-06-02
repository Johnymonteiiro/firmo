/** Formata uma data ISO para dd/mm/aaaa (pt-BR), tratando valores inválidos. */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

/** Converte uma string em BRL ("R$ 1.234,56") para número (1234.56). */
export function parseBRL(value: string): number {
  const normalized = value.replace(/[^\d,]/g, "").replace(",", ".")
  return Number(normalized) || 0
}

/** Formata um número como moeda BRL ("R$ 1.234,56"). */
export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
