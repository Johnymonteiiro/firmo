/**
 * Exportação em CSV para abrir no Excel em português.
 *
 * Duas decisões que evitam a planilha vir embaralhada:
 * - **separador `;`** — o Excel pt-BR usa vírgula como separador decimal, então
 *   com `,` entre colunas ele joga tudo numa célula só;
 * - **BOM UTF-8** — sem ele o Excel lê o arquivo como ANSI e "Gonçalves" vira
 *   "GonÃ§alves".
 */

const SEPARATOR = ";"
const BOM = "﻿"

type CsvValue = string | number | null | undefined

/** Escapa aspas e envolve o campo quando ele contém separador ou quebra. */
function escapeField(value: CsvValue): string {
  if (value === null || value === undefined) return ""
  const text = String(value)
  return /["\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function buildCsv(headers: string[], rows: CsvValue[][]): string {
  return [headers, ...rows]
    .map((row) => row.map(escapeField).join(SEPARATOR))
    .join("\r\n")
}

/**
 * "R$ 1.234,56" → "1234,56"; "-R$ 6.172,80" → "-6172,80".
 * Sai sem símbolo e sem separador de milhar para o Excel reconhecer número —
 * com "R$" na célula ele trata como texto e não soma.
 */
export function csvDecimal(brl: string): string {
  if (!brl) return ""
  const negative = brl.includes("-")
  const digits = brl.replace(/[^\d,]/g, "")
  return negative ? `-${digits}` : digits
}

/** ISO → "dd/mm/aaaa"; vazio quando não há data. */
export function csvDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

/** Sufixo de data para o nome do arquivo (aaaa-mm-dd). */
export function csvFileStamp(reference = new Date()): string {
  return reference.toISOString().slice(0, 10)
}

/** Dispara o download no navegador. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Sem o revoke o blob fica preso na memória até a aba fechar.
  URL.revokeObjectURL(url)
}
