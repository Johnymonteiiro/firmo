import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import { sessionKey } from "@/lib/auth"
import { useFeedbackMutation } from "@/lib/feedback"
import { institutionalEmailSchema } from "@/lib/validation"

export type UserProfile =
  | "ADMINISTRADOR"
  | "GESTOR_CONTRATOS"
  | "GESTOR_FINANCEIRO"
  | "VISITANTE"

export type UserStatus = "ATIVO" | "INATIVO" | "SUSPENSO"

/** Rótulos em PT-BR — usados em colunas, filtros, badges e selects. */
export const USER_PROFILE_LABELS: Record<UserProfile, string> = {
  ADMINISTRADOR: "Administrador",
  GESTOR_CONTRATOS: "Setor de Contrato",
  GESTOR_FINANCEIRO: "Setor Financeiro",
  VISITANTE: "Visitante",
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  SUSPENSO: "Suspenso",
}

export const USER_PROFILES = Object.keys(
  USER_PROFILE_LABELS
) as UserProfile[]

export const USER_STATUSES = Object.keys(USER_STATUS_LABELS) as UserStatus[]

/** Espelha o UserResponseDto do backend. */
export interface User {
  userId: string
  name: string
  email: string
  /** RF-C04 — um usuário pode acumular perfis; a API garante ao menos um. */
  profiles: UserProfile[]
  status: UserStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

/** Body aceito pelo POST /users. */
export interface CreateUserInput {
  name: string
  email: string
  profiles: UserProfile[]
  status?: UserStatus
}

const profileField = z.enum(
  USER_PROFILES as [UserProfile, ...UserProfile[]],
  { message: "Selecione o perfil" }
)

/** RF-C04 — pelo menos um perfil; a API recusa lista vazia. */
const profilesField = z
  .array(profileField)
  .min(1, "Selecione ao menos um perfil")

const statusField = z.enum(USER_STATUSES as [UserStatus, ...UserStatus[]], {
  message: "Selecione o status",
})

/** Validação do form de criação, espelhando as regras do backend. */
export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome")
    .max(150, "Nome: máximo 150 caracteres"),
  email: institutionalEmailSchema(),
  profiles: profilesField,
  status: statusField,
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>

/**
 * Edição (PATCH parcial). `email` é imutável no backend (identidade
 * institucional) e `status` tem rota própria — nenhum dos dois entra aqui.
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome")
    .max(150, "Nome: máximo 150 caracteres"),
  profiles: profilesField,
})

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
/**
 * `profiles` é opcional no envio: quem não administra edita só o próprio nome,
 * e mandar o campo — ainda que com o valor atual — leva 403 (RN-U06).
 */
export type UpdateUserInput = Partial<UpdateUserFormValues>

export interface ListUsersResponse {
  data: User[]
  total: number
  page: number
  pageSize: number
}

export interface ListUsersParams {
  page?: number
  pageSize?: number
  search?: string
  profile?: UserProfile
  status?: UserStatus
}

function buildListParams({
  page = 1,
  pageSize = 20,
  search,
  profile,
  status,
}: ListUsersParams): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  // O backend rejeita `search` vazio (schema .strict()); só envia quando há valor.
  if (search) params.set("search", search)
  if (profile) params.set("profile", profile)
  if (status) params.set("status", status)
  return params.toString()
}

export function listUsers(params: ListUsersParams = {}): Promise<ListUsersResponse> {
  return apiFetch<ListUsersResponse>(`/users?${buildListParams(params)}`)
}

export function getUser(userId: string): Promise<User> {
  return apiFetch<User>(`/users/${userId}`)
}

export function createUser(input: CreateUserInput): Promise<{ userId: string }> {
  return apiFetch<{ userId: string }>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateUser(
  userId: string,
  input: UpdateUserInput
): Promise<unknown> {
  return apiFetch(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

/**
 * Auto-edição (RN-U06). O backend separa as rotas de propósito: `PATCH
 * /users/:userId` exige `usuarios:editar`, que só quem administra tem —
 * corrigir os próprios dados passa por `usuarios:editar_proprio`.
 */
export function updateOwnUser(input: UpdateUserInput): Promise<unknown> {
  return apiFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function changeUserStatus(
  userId: string,
  status: UserStatus
): Promise<unknown> {
  return apiFetch(`/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

export function archiveUser(userId: string): Promise<unknown> {
  return apiFetch(`/users/${userId}`, { method: "DELETE" })
}

export function listArchivedUsers(
  params: ListUsersParams = {}
): Promise<ListUsersResponse> {
  return apiFetch<ListUsersResponse>(
    `/users/archived?${buildListParams(params)}`
  )
}

export function unarchiveUser(userId: string): Promise<unknown> {
  return apiFetch(`/users/${userId}/unarchive`, { method: "POST" })
}

// ---------- importação em lote (RF-U10) ----------

export interface ImportRowError {
  line: number
  email: string | null
  message: string
}

export interface ImportUsersResult {
  dryRun: boolean
  totalRows: number
  valid: number
  imported: number
  errors: ImportRowError[]
}

/** Cabeçalho aceito pelo backend — exibido no dialog como referência. */
export const IMPORT_CSV_HEADER = "nome,email,perfil,status"

export function importUsers(
  csv: string,
  dryRun: boolean
): Promise<ImportUsersResult> {
  return apiFetch<ImportUsersResult>("/users/import", {
    method: "POST",
    body: JSON.stringify({ csv, dryRun }),
  })
}

export const usersKey = ["users"] as const
export const usersArchivedKey = ["users", "archived"] as const

export function useUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...usersKey, page, pageSize],
    queryFn: () => listUsers({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: [...usersKey, "detail", userId],
    queryFn: () => getUser(userId as string),
    enabled: !!userId,
  })
}

export function useCreateUser() {
  return useFeedbackMutation({
    mutationFn: createUser,
    action: "criar",
    entity: "usuário",
    invalidate: [usersKey],
  })
}

export function useUpdateUser() {
  return useFeedbackMutation({
    mutationFn: ({
      userId,
      input,
      self = false,
    }: {
      userId: string
      input: UpdateUserInput
      /** Edição dos próprios dados — vai para `/users/me`. */
      self?: boolean
    }) => (self ? updateOwnUser(input) : updateUser(userId, input)),
    action: "editar",
    entity: "usuário",
    // O nome do usuário é snapshot nos papéis do contrato e aparece no painel.
    invalidate: [usersKey, ["contracts"], ["dashboard"], sessionKey],
  })
}

export function useChangeUserStatus() {
  return useFeedbackMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      changeUserStatus(userId, status),
    action: "alterar-status",
    entity: "usuário",
    invalidate: [usersKey, ["dashboard"]],
  })
}

export function useArchiveUser() {
  return useFeedbackMutation({
    mutationFn: archiveUser,
    action: "arquivar",
    entity: "usuário",
    invalidate: [usersKey, ["dashboard"]],
  })
}

export function useImportUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ csv, dryRun }: { csv: string; dryRun: boolean }) =>
      importUsers(csv, dryRun),
    onSuccess: (result) => {
      // Dry-run não grava nada — só invalida quando houve escrita.
      if (result.imported > 0) {
        queryClient.invalidateQueries({ queryKey: usersKey })
      }
    },
  })
}

export function useArchivedUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...usersArchivedKey, page, pageSize],
    queryFn: () => listArchivedUsers({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useUnarchiveUser() {
  return useFeedbackMutation({
    mutationFn: unarchiveUser,
    action: "desarquivar",
    entity: "usuário",
    invalidate: [usersKey, ["dashboard"]],
  })
}

// ---------- seleção de responsáveis de contrato ----------

const SELECTABLE_PAGE_SIZE = 100

/**
 * Usuários elegíveis aos papéis de contrato: todos os ATIVO. Não há recorte
 * por perfil de acesso — com quatro perfis de sistema, qualquer usuário ativo
 * pode ser gestor ou fiscal, mesmo critério do `ContractRoleResolver`.
 */
export function useSelectableUsers() {
  const query = useQuery({
    queryKey: [...usersKey, "selectable"],
    queryFn: () =>
      listUsers({ pageSize: SELECTABLE_PAGE_SIZE, status: "ATIVO" }),
    staleTime: 60_000,
  })

  const users = query.data?.data ?? []

  return {
    users,
    isLoading: query.isLoading,
    isError: query.isError,
    /** Há mais ativos do que uma página — a lista pode estar incompleta. */
    isTruncated: (query.data?.total ?? 0) > SELECTABLE_PAGE_SIZE,
  }
}
