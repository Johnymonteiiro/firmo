"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { buildCsv, csvFileStamp, downloadCsv } from "@/lib/csv"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon } from "@hugeicons/core-free-icons"

export interface ExportCsvConfig<TData> {
  /** Nome do arquivo, sem extensão nem data — a data é anexada aqui. */
  filename: string
  headers: string[]
  /** Uma linha do CSV, na mesma ordem de `headers`. */
  toRow: (item: TData) => Array<string | number | null | undefined>
}

/**
 * Exporta o que está na tela — as linhas já filtradas pela busca e pelos
 * filtros da toolbar, não o conjunto inteiro. É o que "respeitando os filtros
 * aplicados" quer dizer (RF-NC15 / RF-GO08).
 */
export function ExportCsvButton<TData>({
  rows,
  config,
}: {
  rows: TData[]
  config: ExportCsvConfig<TData>
}) {
  function handleExport() {
    if (rows.length === 0) {
      toast.info("Nada para exportar com os filtros atuais.")
      return
    }

    const csv = buildCsv(config.headers, rows.map(config.toRow))
    downloadCsv(`${config.filename}-${csvFileStamp()}`, csv)
    toast.success(
      `${rows.length} linha${rows.length === 1 ? "" : "s"} exportada${rows.length === 1 ? "" : "s"}.`
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleExport}
    >
      <HugeiconsIcon
        icon={Download04Icon}
        strokeWidth={2}
        className="size-4"
      />
      Exportar CSV
    </Button>
  )
}
