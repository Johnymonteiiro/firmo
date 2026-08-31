"use client"

import * as React from "react"

import { DataTable } from "@/components/data-table/data-table"
import { creditorColumns } from "@/components/non-continuous/creditor-columns"
import { CreditorFormDialog } from "@/components/non-continuous/creditor-form-dialog"
import { csvDecimal } from "@/lib/csv"
import { useCreditors } from "@/lib/non-continuous"
import { PERMISSIONS, useCan } from "@/lib/permissions"

export function CreditorsDataTable() {
  const { data, isLoading, isError, error } = useCreditors(1, 100)
  const canCreate = useCan(PERMISSIONS.naoContinuadosCriar)

  const columns = React.useMemo(() => creditorColumns(), [])

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      getRowId={(c) => c.creditorId}
      searchPlaceholder="Buscar por credor ou objeto..."
      filters={[
        { columnId: "year", title: "Ano" },
        { columnId: "creditorFilter", title: "Credor" },
        {
          columnId: "balanceState",
          title: "Saldo",
          order: ["Com saldo", "Sem saldo"],
        },
      ]}
      exportCsv={{
        filename: "empresas-e-saldos",
        headers: ["Credor", "Objeto", "Ano", "Saldo (R$)"],
        toRow: (c) => [
          c.creditor,
          c.object,
          c.year,
          csvDecimal(c.currentBalance),
        ],
      }}
      actions={canCreate ? <CreditorFormDialog /> : null}
      emptyMessage={
        isError
          ? error instanceof Error
            ? error.message
            : "Erro ao carregar os credores."
          : "Nenhum credor cadastrado."
      }
    />
  )
}
