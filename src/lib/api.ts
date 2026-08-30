const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

/** Cookie legível gravado no login — a metade nossa do double-submit CSRF. */
const CSRF_COOKIE = "firmo_csrf"
const CSRF_HEADER = "X-CSRF-Token"

/** Rotas que não devem disparar refresh nem redirecionamento em 401. */
const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/reset-password"]

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/**
 * Extracts a human-readable message from a NestJS/Zod error body.
 * Nest errors look like `{ message: string | string[], statusCode, error }`.
 */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message
    if (Array.isArray(message)) return message.join(", ")
    if (typeof message === "string") return message
  }
  return fallback
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}

const isMutation = (method?: string): boolean =>
  !!method && !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())

/**
 * Uma renovação por vez: com várias telas carregando juntas, um 401 simultâneo
 * dispararia N refreshes — e como o refresh **rotaciona**, os concorrentes
 * seriam vistos como reúso e derrubariam a sessão inteira.
 */
let refreshing: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      // Libera a próxima tentativa só depois de concluída esta.
      setTimeout(() => {
        refreshing = null
      }, 0)
    })

  return refreshing
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const csrf = readCookie(CSRF_COOKIE)

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    // Sem isso o navegador não manda os cookies HttpOnly da sessão.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(isMutation(init?.method) && csrf ? { [CSRF_HEADER]: csrf } : {}),
      ...init?.headers,
    },
  })
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await request(path, init)

  // Access token expirado (vale 15 min): renova uma vez, em silêncio, e repete.
  if (res.status === 401 && !AUTH_PATHS.some((p) => path.startsWith(p))) {
    const renewed = await refreshSession()
    if (renewed) {
      res = await request(path, init)
    } else if (typeof window !== "undefined") {
      // Sessão morreu de vez — manda para o login preservando o destino.
      const next = encodeURIComponent(
        window.location.pathname + window.location.search
      )
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?next=${next}`
      }
    }
  }

  const isJson = res.headers.get("content-type")?.includes("application/json")
  const body = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    throw new ApiError(
      extractErrorMessage(body, `Erro ${res.status} ao chamar ${path}`),
      res.status
    )
  }

  return body as T
}
