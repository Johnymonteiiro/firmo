"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/lib/auth"

/**
 * Porteiro do dashboard.
 *
 * Deliberadamente **client-side**, e não `middleware.ts`: o cookie de refresh
 * tem `Path=/api/v1/auth/refresh` e por isso nunca chega ao servidor do Next.
 * Um middleware só enxergaria o access token, que expira a cada 15 minutos —
 * e mandaria para o login gente com sessão perfeitamente renovável.
 *
 * Aqui o `useSession` passa pelo `apiFetch`, que tenta a renovação antes de
 * desistir. Segurança de verdade continua sendo do backend: isto é UX.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (isError) {
      const next = encodeURIComponent(pathname)
      router.replace(`/login?next=${next}`)
    }
  }, [isError, pathname, router])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !data) return null

  return <>{children}</>
}
