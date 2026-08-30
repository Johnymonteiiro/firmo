import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = { title: "Entrar — GFC" }

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      description="Acesse com seu e-mail institucional."
    >
      {/* useSearchParams (o `?next=`) exige fronteira de Suspense. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
