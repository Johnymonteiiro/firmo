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
import { cn } from "@/lib/utils"
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

export interface StatusOption<TStatus extends string> {
  value: TStatus
  label: string
  /** Classe de cor do pontinho — ex.: "bg-success". */
  dotClass: string
}

/** Opções usadas quando a entidade não declara as suas (contratos). */
const CONTRACT_STATUS_OPTIONS: StatusOption<ContractRowStatus>[] = [
  { value: "VIGENTE", label: "Vigente", dotClass: "bg-success" },
  { value: "ENCERRADO", label: "Encerrar", dotClass: "bg-muted-foreground" },
]

export interface DataTableRowActionsProps<TStatus extends string = ContractRowStatus> {
  /** Ex.: "contrato", "empenho" — usado nos textos de confirmação/toast. */
  entityLabel: string
  /** Abre a página de detalhes (opcional). */
  onDetails?: () => void
  /** Abre o dialog de edição (omitido quando a entidade não tem update). */
  onEdit?: () => void
  /** Submenu "Alterar status" (ex.: contratos). */
  onChangeStatus?: (status: TStatus) => Promise<unknown> | void
  /**
   * Opções do submenu de status. Omitido = par de contratos
   * (Vigente/Encerrar), preservando as chamadas existentes.
   */
  statusOptions?: StatusOption<TStatus>[]
  /** Status atual — desabilita a opção correspondente no submenu. */
  currentStatus?: string
  /** Abre o drawer de histórico (auditoria) do registro. */
  history?: { entity: AuditEntity; recordId: string; subtitle?: string }
  /** Executa o arquivamento (DELETE). */
  onArchive: () => Promise<unknown>
  /** Itens extras (DropdownMenuItem) renderizados no topo do menu. */
  extraActions?: React.ReactNode
  /** Rótulo/comportamento da ação destrutiva (default: "Arquivar"). */
  destructiveAction?: {
    label: string
    confirmTitle: string
    confirmDescription: string
    successToast: string
  }
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Ações de linha: Editar (opcional) + Arquivar (com confirmação). */
export function DataTableRowActions<TStatus extends string = ContractRowStatus>({
  entityLabel,
  onDetails,
  onEdit,
  onChangeStatus,
  statusOptions,
  currentStatus,
  history,
  onArchive,
  extraActions,
  destructiveAction,
}: DataTableRowActionsProps<TStatus>) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [isArchiving, setIsArchiving] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)

  // Sem `statusOptions`, TStatus é ContractRowStatus (default do genérico).
  const options =
    statusOptions ?? (CONTRACT_STATUS_OPTIONS as StatusOption<TStatus>[])

  function handleChangeStatus(status: TStatus) {
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
        toast.success(
          destructiveAction?.successToast ??
            `${capitalize(entityLabel)} arquivado.`
        )
        setConfirmOpen(false)
      })
      .catch((err) => {
        toast.error(
          err instanceof ApiError
            ? err.message
            : `Não foi possível concluir a ação no ${entityLabel}.`
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
          {extraActions ? (
            <>
              {extraActions}
              <DropdownMenuSeparator />
            </>
          ) : null}
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
                  {options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      disabled={currentStatus === option.value}
                      onClick={() => handleChangeStatus(option.value)}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          option.dotClass
                        )}
                      />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
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
            {destructiveAction?.label ?? "Arquivar"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={destructiveAction?.confirmTitle ?? `Arquivar ${entityLabel}?`}
        description={
          destructiveAction?.confirmDescription ??
          "O registro vai para os arquivados e pode ser restaurado depois."
        }
        confirmLabel={destructiveAction?.label ?? "Arquivar"}
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
