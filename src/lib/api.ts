const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

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

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json")
  const body = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    throw new ApiError(
      extractErrorMessage(body, `Erro ${res.status} ao chamar ${path}`),
      res.status
    )
  }

  return body as T
}
