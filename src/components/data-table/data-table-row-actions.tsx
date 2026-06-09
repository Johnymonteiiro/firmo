"use client"

import * as React from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { HistoryDrawer } from "@/components/history/history-drawer"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApiError } from "@/lib/api"
import type { AuditEntity } from "@/lib/audit"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalCircle01Icon,
  PencilEdit02Icon,
  Archive02Icon,
  ViewIcon,
  ClockIcon,
  ArrowDataTransferHorizontalIcon,
} from "@hugeicons/core-free-icons"

export type ContractRowStatus = "VIGENTE" | "ENCERRADO"

export interface DataTableRowActionsProps {
  /** Ex.: "contrato", "empenho" — usado nos textos de confirmação/toast. */
  entityLabel: string
  /** Abre a página de detalhes (opcional). */
  onDetails?: () => void
  /** Abre o dialog de edição (omitido quando a entidade não tem update). */
  onEdit?: () => void
  /** Submenu "Alterar status" (ex.: contratos). */
  onChangeStatus?: (status: ContractRowStatus) => Promise<unknown> | void
  /** Status atual — desabilita a opção correspondente no submenu. */
  currentStatus?: string
  /** Abre o drawer de histórico (auditoria) do registro. */
  history?: { entity: AuditEntity; recordId: string; subtitle?: string }
  /** Executa o arquivamento (DELETE). */
  onArchive: () => Promise<unknown>
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Ações de linha: Editar (opcional) + Arquivar (com confirmação). */
export function DataTableRowActions({
  entityLabel,
  onDetails,
  onEdit,
  onChangeStatus,
  currentStatus,
  history,
  onArchive,
}: DataTableRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [isArchiving, setIsArchiving] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)

  function handleChangeStatus(status: ContractRowStatus) {
    Promise.resolve(onChangeStatus?.(status))
      .then(() => toast.success(`Status do ${entityLabel} alterado.`))
      .catch((err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `Não foi possível alterar o status do ${entityLabel}.`
        )
      )
  }

  function handleArchive() {
    setIsArchiving(true)
    Promise.resolve(onArchive())
      .then(() => {
        toast.success(`${capitalize(entityLabel)} arquivado.`)
        setConfirmOpen(false)
      })
      .catch((err) => {
        toast.error(
          err instanceof ApiError
            ? err.message
            : `Não foi possível arquivar o ${entityLabel}.`
        )
      })
      .finally(() => setIsArchiving(false))
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="size-7" size="icon" variant="ghost">
            <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
            <span className="sr-only">Ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-48">
          {onDetails ? (
            <>
              <DropdownMenuItem onClick={onDetails}>
                <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
                Detalhes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {onEdit ? (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {onChangeStatus ? (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HugeiconsIcon
                    icon={ArrowDataTransferHorizontalIcon}
                    strokeWidth={2}
                  />
                  Alterar status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    disabled={currentStatus === "VIGENTE"}
                    onClick={() => handleChangeStatus("VIGENTE")}
                  >
                    <span className="size-1.5 rounded-full bg-success" />
                    Vigente
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={currentStatus === "ENCERRADO"}
                    onClick={() => handleChangeStatus("ENCERRADO")}
                  >
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    Encerrar
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {history ? (
            <>
              <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
                <HugeiconsIcon icon={ClockIcon} strokeWidth={2} />
                Histórico
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
            Arquivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Arquivar ${entityLabel}?`}
        description="O registro vai para os arquivados e pode ser restaurado depois."
        confirmLabel="Arquivar"
        destructive
        isPending={isArchiving}
        onConfirm={handleArchive}
      />

      {history ? (
        <HistoryDrawer
          entity={history.entity}
          recordId={history.recordId}
          entityLabel={entityLabel}
          subtitle={history.subtitle}
          open={historyOpen}
          onOpenChange={setHistoryOpen}
        />
      ) : null}
    </>
  )
}
