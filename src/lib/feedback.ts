import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError } from "@/lib/api"

/**
 * Aviso padrão de fim de operação.
 *
 * Mora nos hooks de mutação, e não em cada diálogo, por dois motivos: a mesma
 * ação disparada de dois lugares (a linha da tabela e o card de arquivados)
 * dizia coisas diferentes, e toda tela nova precisava lembrar de avisar. Aqui
 * é uma vez só, no lugar onde a operação de fato acontece.
 *
 * O texto do erro vem do backend quando ele mandou um (`ApiError`) — a
 * mensagem da regra de negócio é sempre mais útil que "não foi possível".
 */
export type MutationAction =
  | "criar"
  | "editar"
  | "arquivar"
  | "desarquivar"
  | "anular"
  | "alterar-status"
  | "importar"

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

/** `entity` no singular e minúsculo: "contrato", "empenho", "reforço". */
function successMessage(action: MutationAction, entity: string): string {
  switch (action) {
    case "criar":
      return `${capitalize(entity)} criado.`
    case "editar":
      return `${capitalize(entity)} atualizado.`
    case "arquivar":
      return `${capitalize(entity)} arquivado.`
    case "desarquivar":
      return `${capitalize(entity)} restaurado.`
    case "anular":
      return `${capitalize(entity)} anulado.`
    case "alterar-status":
      return `Status do ${entity} alterado.`
    case "importar":
      return `Importação de ${entity} concluída.`
  }
}

function failureMessage(action: MutationAction, entity: string): string {
  switch (action) {
    case "criar":
      return `Não foi possível criar o ${entity}.`
    case "editar":
      return `Não foi possível salvar o ${entity}.`
    case "arquivar":
      return `Não foi possível arquivar o ${entity}.`
    case "desarquivar":
      return `Não foi possível restaurar o ${entity}.`
    case "anular":
      return `Não foi possível anular o ${entity}.`
    case "alterar-status":
      return `Não foi possível alterar o status do ${entity}.`
    case "importar":
      return `Não foi possível importar ${entity}.`
  }
}

export function notifySuccess(action: MutationAction, entity: string): void {
  toast.success(successMessage(action, entity))
}

export function notifyFailure(
  action: MutationAction,
  entity: string,
  error: unknown
): void {
  toast.error(
    error instanceof ApiError ? error.message : failureMessage(action, entity)
  )
}

/**
 * Mutação com aviso e invalidação de cache — o formato de quase toda escrita
 * do sistema. `invalidate` recebe as chaves que a operação suja; a lista
 * costuma ter mais de uma quando o registro alimenta o total de outra tela
 * (um reforço mexe no saldo do empenho, por exemplo).
 */
export function useFeedbackMutation<TVars, TData>({
  mutationFn,
  action,
  entity,
  invalidate,
}: {
  mutationFn: (vars: TVars) => Promise<TData>
  action: MutationAction
  entity: string
  invalidate: QueryKey[]
}): UseMutationResult<TData, unknown, TVars> {
  const queryClient = useQueryClient()

  return useMutation<TData, unknown, TVars>({
    mutationFn,
    onSuccess: () => {
      for (const queryKey of invalidate) {
        queryClient.invalidateQueries({ queryKey })
      }
      notifySuccess(action, entity)
    },
    onError: (error) => notifyFailure(action, entity, error),
  })
}
