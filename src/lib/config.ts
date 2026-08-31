import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import type { PermissionKey } from "@/lib/permissions"
import { sessionKey } from "@/lib/auth"

/**
 * Configurações → Permissões (RN-C04). A superfície HTTP é `/config/*`; quem
 * guarda os dados e resolve as regras é o módulo `authorization` do backend.
 */

export interface PermissionRoute {
  method: string
  /** Caminho com parâmetros nomeados, ex.: `/api/v1/users/:userId`. */
  pattern: string
}

/** Unidade da matriz (RN-C07): um par módulo × ação. */
export interface Permission {
  permissionId: string
  module: string
  action: string
  description: string | null
  routes: PermissionRoute[]
}

export interface PermissionProfile {
  profileId: string
  slug: string
  name: string
  description: string | null
  /** RN-C06 — perfil de sistema não é excluído nem perde as permissões-base. */
  isSystem: boolean
  /** RN-C05 — desativar é a alternativa a excluir. */
  active: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface ProfileWithPermissions {
  profile: PermissionProfile
  permissions: PermissionKey[]
  userCount: number
}

export const permissionLabel = (permission: Permission): string =>
  `${permission.module}:${permission.action}` as PermissionKey

/** Rótulos em PT-BR dos módulos do catálogo, para os cabeçalhos da matriz. */
export const MODULE_LABELS: Record<string, string> = {
  contratos: "Contratos",
  empenhos: "Empenhos",
  reforcos: "Reforços",
  faturamentos: "Faturamentos",
  auditoria: "Auditoria",
  usuarios: "Usuários",
  sessao: "Sessão",
  configuracoes: "Configurações",
  nao_continuados: "Não continuados",
  gestao_orcamentaria: "Gestão orçamentária",
}

/** Módulo que ainda não tem rótulo aparece pelo próprio nome, capitalizado. */
export const moduleLabel = (module: string): string =>
  MODULE_LABELS[module] ?? module.charAt(0).toUpperCase() + module.slice(1)

export const ACTION_LABELS: Record<string, string> = {
  visualizar: "Visualizar",
  criar: "Criar",
  editar: "Editar",
  editar_proprio: "Editar os próprios dados",
  arquivar: "Arquivar",
  anular: "Anular",
  gerenciar_propria: "Gerenciar a própria sessão",
  gerenciar_perfis: "Gerenciar perfis",
  gerenciar_permissoes: "Gerenciar permissões",
}

export const actionLabel = (action: string): string =>
  ACTION_LABELS[action] ?? action.replace(/_/g, " ")

// ───────────────────────────────────────────────────────────────
// Formulários
// ───────────────────────────────────────────────────────────────

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do perfil")
    .max(80, "Nome: máximo 80 caracteres"),
  description: z
    .string()
    .trim()
    .max(280, "Descrição: máximo 280 caracteres")
    .optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

// ───────────────────────────────────────────────────────────────
// Chamadas
// ───────────────────────────────────────────────────────────────

export function listPermissions(): Promise<{ data: Permission[] }> {
  return apiFetch<{ data: Permission[] }>("/config/permissions")
}

export function listProfiles(): Promise<{ data: ProfileWithPermissions[] }> {
  return apiFetch<{ data: ProfileWithPermissions[] }>("/config/profiles")
}

/** RF-C05 — devolve os ids; o nome vem do cadastro de usuários. */
export function listProfileUsers(
  profileId: string
): Promise<{ data: string[] }> {
  return apiFetch<{ data: string[] }>(`/config/profiles/${profileId}/users`)
}

export function createProfile(
  input: ProfileFormValues
): Promise<{ profileId: string }> {
  return apiFetch<{ profileId: string }>("/config/profiles", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateProfile(
  profileId: string,
  input: ProfileFormValues
): Promise<unknown> {
  return apiFetch(`/config/profiles/${profileId}`, {
    method: "PATCH",
    // O backend aceita `null` para limpar a descrição; string vazia seria
    // gravada como vazia e o campo continuaria "preenchido".
    body: JSON.stringify({
      name: input.name,
      description: input.description || null,
    }),
  })
}

export function duplicateProfile(
  profileId: string,
  name: string
): Promise<{ profileId: string }> {
  return apiFetch<{ profileId: string }>(
    `/config/profiles/${profileId}/duplicate`,
    { method: "POST", body: JSON.stringify({ name }) }
  )
}

export interface DeactivateProfileResult {
  /** Falso = havia usuários ativos e o perfil foi apenas desativado (RN-C05). */
  deleted: boolean
  activeUsers: number
}

export function deactivateProfile(
  profileId: string
): Promise<DeactivateProfileResult> {
  return apiFetch<DeactivateProfileResult>(`/config/profiles/${profileId}`, {
    method: "DELETE",
  })
}

export interface SetPermissionsResult {
  /** RF-C10 — quantos usuários tiveram o acesso alterado. */
  affectedUsers: number
}

/**
 * Grava a matriz inteira do perfil (RF-C03). `confirm` é a dupla checagem da
 * RN-C02 — sem ele a API recusa com 400.
 */
export function setProfilePermissions(
  profileId: string,
  permissions: PermissionKey[]
): Promise<SetPermissionsResult> {
  return apiFetch<SetPermissionsResult>(
    `/config/profiles/${profileId}/permissions`,
    {
      method: "PUT",
      body: JSON.stringify({ permissions, confirm: true }),
    }
  )
}

/** RF-C04 — substitui o conjunto de perfis de um usuário. */
export function setUserProfiles(
  userId: string,
  profileIds: string[]
): Promise<unknown> {
  return apiFetch(`/config/users/${userId}/profiles`, {
    method: "PUT",
    body: JSON.stringify({ profileIds, confirm: true }),
  })
}

// ───────────────────────────────────────────────────────────────
// Hooks
// ───────────────────────────────────────────────────────────────

export const configKey = ["config"] as const
export const permissionsKey = [...configKey, "permissions"] as const
export const profilesKey = [...configKey, "profiles"] as const

export function usePermissionCatalog() {
  return useQuery({
    queryKey: permissionsKey,
    queryFn: listPermissions,
    // O catálogo só muda com deploy (rota nova) — não vale refazer a cada foco.
    staleTime: 10 * 60 * 1000,
  })
}

export function useProfiles() {
  return useQuery({ queryKey: profilesKey, queryFn: listProfiles })
}

export function useProfileUsers(profileId: string | null) {
  return useQuery({
    queryKey: [...profilesKey, profileId, "users"],
    queryFn: () => listProfileUsers(profileId as string),
    enabled: !!profileId,
  })
}

/**
 * Toda escrita aqui pode mudar o que a própria sessão pode fazer — por isso
 * invalida também `/auth/me`, que é a origem do que a interface esconde.
 */
function useConfigMutation<TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: configKey })
      void queryClient.invalidateQueries({ queryKey: sessionKey })
    },
  })
}

export function useCreateProfile() {
  return useConfigMutation(createProfile)
}

export function useUpdateProfile() {
  return useConfigMutation(
    ({ profileId, input }: { profileId: string; input: ProfileFormValues }) =>
      updateProfile(profileId, input)
  )
}

export function useDuplicateProfile() {
  return useConfigMutation(
    ({ profileId, name }: { profileId: string; name: string }) =>
      duplicateProfile(profileId, name)
  )
}

export function useDeactivateProfile() {
  return useConfigMutation(deactivateProfile)
}

export function useSetProfilePermissions() {
  return useConfigMutation(
    ({
      profileId,
      permissions,
    }: {
      profileId: string
      permissions: PermissionKey[]
    }) => setProfilePermissions(profileId, permissions)
  )
}

export function useSetUserProfiles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      profileIds,
    }: {
      userId: string
      profileIds: string[]
    }) => setUserProfiles(userId, profileIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: configKey })
      void queryClient.invalidateQueries({ queryKey: ["users"] })
      void queryClient.invalidateQueries({ queryKey: sessionKey })
    },
  })
}
