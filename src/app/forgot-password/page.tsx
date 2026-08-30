import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = { title: "Esqueci minha senha — GFC" }

export default function EsqueciSenhaPage() {
  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Enviaremos um link de redefinição para o seu e-mail institucional."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
