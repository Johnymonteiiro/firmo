import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import type { PermissionKey } from "@/lib/permissions"
import type { UserProfile } from "@/lib/users"

/** O que o backend exige antes de liberar o uso do sistema. */
export type PostLoginAction =
  | "NONE"
  | "MUST_CHANGE_PASSWORD"
  | "PASSWORD_EXPIRED"

export interface AuthenticatedUser {
  userId: string
  name: string
  email: string
  profiles: UserProfile[]
}

export interface LoginResponse {
  user: AuthenticatedUser
  nextAction: PostLoginAction
  expiresAt: string
}

/**
 * `/auth/me` devolve só o essencial — o token não carrega nome nem e-mail.
 * `permissions` é a união das permissões dos perfis, resolvida no banco a cada
 * requisição: é o que a UI usa para esconder ação sem permissão, sem nunca
 * virar a autoridade sobre ela.
 */
export interface SessionResponse {
  userId: string
  profiles: UserProfile[]
  permissions: PermissionKey[]
}

/** Espelha a política do backend (RN-U10). */
export const MIN_PASSWORD_LENGTH = 10
const MAX_PASSWORD_LENGTH = 72

const passwordField = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`)
  .max(MAX_PASSWORD_LENGTH, `Máximo de ${MAX_PASSWORD_LENGTH} caracteres`)

export const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail"),
  password: z.string().min(1, "Informe a senha"),
})
export type LoginFormValues = z.infer<typeof loginSchema>

/** `confirm` só existe no formulário — o backend não recebe esse campo. */
const withConfirmation = <T extends { newPassword: string }>(
  schema: z.ZodType<T & { confirmPassword: string }>
) =>
  schema.refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  })

export const changePasswordSchema = withConfirmation(
  z.object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
)
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export const resetPasswordSchema = withConfirmation(
  z.object({
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
)
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Informe o e-mail"),
})
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// ───────────────────────────────────────────────────────────────
// Chamadas
// ───────────────────────────────────────────────────────────────

export function login(input: LoginFormValues): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function logout(): Promise<unknown> {
  return apiFetch("/auth/logout", { method: "POST" })
}

export function getSession(): Promise<SessionResponse> {
  return apiFetch<SessionResponse>("/auth/me")
}

export function changePassword(input: {
  currentPassword: string
  newPassword: string
}): Promise<unknown> {
  return apiFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(input: {
  token: string
  newPassword: string
}): Promise<unknown> {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

// ───────────────────────────────────────────────────────────────
// Hooks
// ───────────────────────────────────────────────────────────────

export const sessionKey = ["auth", "session"] as const

export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: getSession,
    // Sem retry: 401 aqui significa "não logado", não falha transitória.
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKey })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Limpa tudo: os dados em cache pertenciam à sessão que acabou.
      queryClient.clear()
    },
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      // O backend revoga as sessões na troca — o cache não vale mais nada.
      queryClient.clear()
    },
  })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword })
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword })
}
