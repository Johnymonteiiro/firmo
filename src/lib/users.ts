import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import { institutionalEmailSchema } from "@/lib/validation"

export type UserProfile =
  | "ADMINISTRADOR"
  | "GESTOR_CONTRATOS"
  | "FISCAL_ADMINISTRATIVO"
  | "FISCAL_TECNICO"
  | "SERVIDOR"
  | "AUDITOR"

export type UserStatus = "ATIVO" | "INATIVO" | "SUSPENSO"

/** Rótulos em PT-BR — usados em colunas, filtros, badges e selects. */
export const USER_PROFILE_LABELS: Record<UserProfile, string> = {
  ADMINISTRADOR: "Administrador",
  GESTOR_CONTRATOS: "Gestor de Contratos",
  FISCAL_ADMINISTRATIVO: "Fiscal Administrativo",
  FISCAL_TECNICO: "Fiscal Técnico",
  SERVIDOR: "Servidor",
  AUDITOR: "Auditor",
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
  profile: UserProfile
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
  profile: UserProfile
  status?: UserStatus
}

const profileField = z.enum(
  USER_PROFILES as [UserProfile, ...UserProfile[]],
  { message: "Selecione o perfil" }
)

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
  profile: profileField,
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
  profile: profileField,
})

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
export type UpdateUserInput = UpdateUserFormValues

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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      input,
    }: {
      userId: string
      input: UpdateUserInput
    }) => updateUser(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey })
    },
  })
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      changeUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey })
    },
  })
}

export function useArchiveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archiveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey })
    },
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unarchiveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey })
    },
  })
}

// ---------- seleção de responsáveis de contrato ----------

/**
 * Perfis aceitos por papel do contrato — espelha o `ContractRoleResolver` do
 * backend. ADMINISTRADOR é coringa em todos: enquanto a base de usuários está
 * sendo montada, ele precisa poder assumir qualquer papel.
 */
export const CONTRACT_ROLE_PROFILES = {
  manager: ["GESTOR_CONTRATOS", "ADMINISTRADOR"],
  adminFiscal: ["FISCAL_ADMINISTRATIVO", "ADMINISTRADOR"],
  techFiscal: ["FISCAL_TECNICO", "ADMINISTRADOR"],
} as const satisfies Record<string, readonly UserProfile[]>

export type ContractRole = keyof typeof CONTRACT_ROLE_PROFILES

const SELECTABLE_PAGE_SIZE = 100

/**
 * Usuários elegíveis a um papel de contrato: ATIVO e com perfil compatível.
 * Uma única busca dos ativos serve os três pickers — o recorte por perfil é
 * client-side porque a API filtra um perfil por vez e cada papel aceita dois.
 */
export function useSelectableUsers(role: ContractRole) {
  const query = useQuery({
    queryKey: [...usersKey, "selectable"],
    queryFn: () =>
      listUsers({ pageSize: SELECTABLE_PAGE_SIZE, status: "ATIVO" }),
    staleTime: 60_000,
  })

  const allowed = CONTRACT_ROLE_PROFILES[role] as readonly UserProfile[]
  const users = (query.data?.data ?? []).filter((user) =>
    allowed.includes(user.profile)
  )

  return {
    users,
    isLoading: query.isLoading,
    isError: query.isError,
    /** Há mais ativos do que uma página — a lista pode estar incompleta. */
    isTruncated: (query.data?.total ?? 0) > SELECTABLE_PAGE_SIZE,
  }
}
