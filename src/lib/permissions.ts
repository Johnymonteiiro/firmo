"use client"

import * as React from "react"

import { useSession } from "@/lib/auth"

/**
 * Chave canônica de uma permissão: `modulo:acao` (RN-C07). O catálogo vive no
 * banco — esta lista é só o subconjunto que a interface precisa nomear para
 * decidir o que mostrar. Acrescentar ação no backend não obriga a mexer aqui;
 * só entra na lista o que alguma tela consulta.
 */
export const PERMISSIONS = {
  contratosVisualizar: "contratos:visualizar",
  contratosCriar: "contratos:criar",
  contratosEditar: "contratos:editar",
  contratosArquivar: "contratos:arquivar",

  empenhosVisualizar: "empenhos:visualizar",
  empenhosCriar: "empenhos:criar",
  empenhosArquivar: "empenhos:arquivar",

  reforcosVisualizar: "reforcos:visualizar",
  reforcosCriar: "reforcos:criar",
  reforcosAnular: "reforcos:anular",

  faturamentosVisualizar: "faturamentos:visualizar",
  faturamentosCriar: "faturamentos:criar",
  faturamentosEditar: "faturamentos:editar",
  faturamentosArquivar: "faturamentos:arquivar",

  auditoriaVisualizar: "auditoria:visualizar",

  usuariosVisualizar: "usuarios:visualizar",
  usuariosCriar: "usuarios:criar",
  usuariosEditar: "usuarios:editar",
  usuariosEditarProprio: "usuarios:editar_proprio",
  usuariosArquivar: "usuarios:arquivar",

  configuracoesVisualizar: "configuracoes:visualizar",
  configuracoesGerenciarPerfis: "configuracoes:gerenciar_perfis",
  configuracoesGerenciarPermissoes: "configuracoes:gerenciar_permissoes",
} as const

/** Aceita qualquer `modulo:acao` — o catálogo é editável em tempo de execução. */
export type PermissionKey = `${string}:${string}`

export type Can = (...keys: PermissionKey[]) => boolean

/**
 * Predicado de permissão da sessão corrente. Verdadeiro se **alguma** das
 * chaves informadas estiver concedida.
 *
 * Enquanto a sessão carrega, responde `false`: é melhor a ação aparecer um
 * instante depois do que piscar e sumir. Isto é dica de interface — quem
 * decide de verdade é o `PermissionGuard` do backend, que responde 403.
 */
export function usePermissions(): { can: Can; isLoading: boolean } {
  const { data, isLoading } = useSession()

  const granted = React.useMemo(
    () => new Set<string>(data?.permissions ?? []),
    [data?.permissions]
  )

  const can = React.useCallback<Can>(
    (...keys) => keys.some((key) => granted.has(key)),
    [granted]
  )

  return { can, isLoading }
}

/** Açúcar para o caso de uma chave só. */
export function useCan(...keys: PermissionKey[]): boolean {
  const { can } = usePermissions()
  return can(...keys)
}
