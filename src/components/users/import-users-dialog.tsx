"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormDialog } from "@/components/form/form-dialog"
import { Field, SectionTitle } from "@/components/form/form-field"
import { ApiError } from "@/lib/api"
import {
  IMPORT_CSV_HEADER,
  useImportUsers,
  type ImportUsersResult,
} from "@/lib/users"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload01Icon } from "@hugeicons/core-free-icons"

/**
 * Importação em duas etapas (RF-U10): a primeira submissão valida em dry-run e
 * mostra o relatório; só a segunda grava. O operador nunca importa às cegas.
 */
export function ImportUsersDialog() {
  const [open, setOpen] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [csv, setCsv] = React.useState("")
  const [report, setReport] = React.useState<ImportUsersResult | null>(null)
  const importUsers = useImportUsers()

  function reset() {
    setFileName(null)
    setCsv("")
    setReport(null)
    importUsers.reset()
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setReport(null)
    importUsers.reset()
    setCsv(await file.text())
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!csv) return

    // Sem relatório ainda → valida. Com relatório → confirma a gravação.
    const dryRun = report === null

    importUsers.mutate(
      { csv, dryRun },
      {
        onSuccess: (result) => {
          if (result.dryRun) {
            setReport(result)
            return
          }
          toast.success(
            `${result.imported} usuário(s) importado(s).` +
              (result.errors.length
                ? ` ${result.errors.length} linha(s) ignorada(s).`
                : "")
          )
          handleOpenChange(false)
        },
      }
    )
  }

  const errorMessage =
    importUsers.error instanceof ApiError
      ? importUsers.error.message
      : importUsers.error
        ? "Não foi possível processar o arquivo."
        : null

  const canCommit = report !== null && report.valid > 0

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Importar Usuários"
      formId="import-users-form"
      onSubmit={handleSubmit}
      isPending={importUsers.isPending}
      errorMessage={errorMessage}
      submitLabel={
        report === null
          ? "Validar arquivo"
          : canCommit
            ? `Importar ${report.valid} usuário(s)`
            : "Nada a importar"
      }
      contentClassName="h-auto max-h-[85vh] w-170"
      trigger={
        <Button size="sm" variant="outline" className="gap-2">
          <HugeiconsIcon
            icon={Upload01Icon}
            strokeWidth={2}
            className="size-4"
          />
          Importar CSV
        </Button>
      }
    >
      <SectionTitle>Arquivo</SectionTitle>
      <Field label="Planilha CSV" className="col-span-2">
        <Input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          Cabeçalho esperado:{" "}
          <code className="font-mono">{IMPORT_CSV_HEADER}</code> — separador{" "}
          <code className="font-mono">,</code> ou{" "}
          <code className="font-mono">;</code>. A coluna{" "}
          <code className="font-mono">status</code> é opcional (padrão ATIVO).
        </p>
      </Field>

      {report && (
        <>
          <SectionTitle>Resultado da validação</SectionTitle>
          <div className="col-span-2 grid grid-cols-3 gap-3">
            <ReportTile label="Linhas lidas" value={report.totalRows} />
            <ReportTile label="Válidas" value={report.valid} tone="success" />
            <ReportTile
              label="Com erro"
              value={report.errors.length}
              tone={report.errors.length > 0 ? "destructive" : "default"}
            />
          </div>

          {report.errors.length > 0 && (
            <div className="col-span-2 max-h-56 overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium">Linha</th>
                    <th className="px-3 py-2 font-medium">E-mail</th>
                    <th className="px-3 py-2 font-medium">Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {report.errors.map((error) => (
                    <tr
                      key={`${error.line}-${error.email ?? ""}`}
                      className="border-t"
                    >
                      <td className="px-3 py-2 font-mono tabular-nums">
                        {error.line}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {error.email ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {error.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="col-span-2 text-xs text-muted-foreground">
            {canCommit
              ? "Confirmar importa apenas as linhas válidas; as com erro são ignoradas."
              : "Corrija o arquivo e selecione-o novamente."}
          </p>
        </>
      )}

      {fileName && !report && (
        <p className="col-span-2 text-xs text-muted-foreground">
          Arquivo selecionado: <span className="font-mono">{fileName}</span>
        </p>
      )}
    </FormDialog>
  )
}

function ReportTile({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: number
  tone?: "default" | "success" | "destructive"
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground"

  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </p>
    </div>
  )
}
