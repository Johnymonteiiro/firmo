import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { SetupPasswordForm } from "@/components/auth/setup-password-form"

export const metadata = { title: "Primeiro acesso — GFC" }

export default function DefinirSenhaPage() {
  return (
    <AuthShell
      title="Bem-vindo ao GFC"
      description="Defina a sua senha para começar a usar o sistema."
    >
      {/* O token vem em `?token=` — useSearchParams exige Suspense. */}
      <Suspense fallback={null}>
        <SetupPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
