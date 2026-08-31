"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { movementColumns } from "@/components/non-continuous/movement-columns"
import { MovementFormDialog } from "@/components/non-continuous/movement-form-dialog"
import { QUALIFICATION_LABEL } from "@/components/non-continuous/movement-qualification-badge"
import { csvDate, csvDecimal } from "@/lib/csv"
import { useCreditors, useMovements } from "@/lib/non-continuous"
import { PERMISSIONS, useCan } from "@/lib/permissions"
import { HugeiconsIcon } from "@hugeicons/react"
import { MultiplicationSignIcon } from "@hugeicons/core-free-icons"

/**
 * Razão dos não continuados. Aceita `?creditorId=` na URL — é por onde a tela
 * de Empresas e Saldos manda ver os movimentos de um registro (RF-NC06), com um
 * chip que mostra o recorte e o desfaz.
 */
export function MovementsDataTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const creditorId = searchParams.get("creditorId")

  const { data, isLoading, isError, error } = useMovements(1, 100)
  const { data: creditors } = useCreditors(1, 100)
  const canCreate = useCan(PERMISSIONS.naoContinuadosCriar)

  const getCreditorName = React.useMemo(() => {
    const map = new Map(
      (creditors?.data ?? []).map((c) => [c.creditorId, c.creditor])
    )
    return (id: string) => map.get(id) ?? "—"
  }, [creditors])

  const columns = React.useMemo(
    () => movementColumns({ getCreditorName }),
    [getCreditorName]
  )

  const rows = React.useMemo(() => {
    const all = data?.data ?? []
    return creditorId ? all.filter((m) => m.creditorId === creditorId) : all
  }, [data, creditorId])

  return (
    <div className="flex flex-col gap-3">
      {creditorId ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtrando por credor:</span>
          <span className="font-medium">{getCreditorName(creditorId)}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() =>
              router.replace(
                "/dashboard/contratos/nao-continuados/empenhos-pagamentos/todos"
              )
            }
          >
            <HugeiconsIcon icon={MultiplicationSignIcon} strokeWidth={2} />
            Limpar
          </Button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        getRowId={(m) => m.movementId}
        searchPlaceholder="Buscar por sequencial ou processo..."
        filters={[
          { columnId: "qualification", title: "Qualificação" },
          { columnId: "year", title: "Ano" },
          { columnId: "creditorFilter", title: "Credor" },
          {
            columnId: "paymentState",
            title: "Pagamento",
            order: ["Pago", "Sem pagamento"],
          },
        ]}
        exportCsv={{
          filename: "empenhos-e-pagamentos",
          headers: [
            "Credor",
            "Data de emissão",
            "Ano",
            "Sequencial",
            "Processo",
            "Qualificação",
            "Valor (R$)",
            "Data do pagamento",
          ],
          toRow: (m) => [
            getCreditorName(m.creditorId),
            csvDate(m.issueDate),
            m.year,
            m.sequentialNumber,
            m.processNumber,
            QUALIFICATION_LABEL[m.qualification],
            csvDecimal(m.value),
            csvDate(m.paymentDate),
          ],
        }}
        actions={
          canCreate ? (
            <MovementFormDialog defaultCreditorId={creditorId ?? undefined} />
          ) : null
        }
        emptyMessage={
          isError
            ? error instanceof Error
              ? error.message
              : "Erro ao carregar os movimentos."
            : creditorId
              ? "Nenhum movimento para este credor."
              : "Nenhum empenho ou pagamento lançado."
        }
      />
    </div>
  )
}
