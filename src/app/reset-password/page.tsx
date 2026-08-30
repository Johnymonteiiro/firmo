import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata = { title: "Redefinir senha — GFC" }

export default function RedefinirSenhaPage() {
  return (
    <AuthShell title="Redefinir senha">
      {/* O token vem em `?token=` — useSearchParams exige Suspense. */}
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
