/** Formata uma data ISO para dd/mm/aaaa (pt-BR), tratando valores inválidos. */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}
