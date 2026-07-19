"use client"

import { MaskedInput } from "@/components/ui/masked-input"

/** Prefixo fixo do número de processo (código do órgão/UASG). */
export const PROCESS_PREFIX = "23080."

export interface ProcessInputProps {
  /** Valor completo, com prefixo (ex.: "23080.048126/2026-70"). */
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  "aria-invalid"?: boolean
}

/**
 * Input de número de processo com o prefixo `23080.` fixo (não editável).
 * O usuário digita apenas `{6 dígitos}/{ano}-{2 dígitos}`; o valor emitido
 * para o form já sai completo, com o prefixo.
 */
export function ProcessInput({
  value,
  onChange,
  onBlur,
  placeholder = "048126/2026-70",
  "aria-invalid": ariaInvalid,
}: ProcessInputProps) {
  const rest = value?.startsWith(PROCESS_PREFIX)
    ? value.slice(PROCESS_PREFIX.length)
    : (value ?? "")

  return (
    <div className="flex w-full">
      <span
        aria-hidden
        className="inline-flex select-none items-center rounded-l-md border border-r-0 border-input bg-muted px-2.5 font-mono text-sm text-muted-foreground"
      >
        {PROCESS_PREFIX}
      </span>
      <MaskedInput
        mask="000000/0000-00"
        className="rounded-l-none"
        placeholder={placeholder}
        value={rest}
        onAccept={(v) => onChange(v ? PROCESS_PREFIX + v : "")}
        onBlur={onBlur}
        aria-invalid={ariaInvalid}
      />
    </div>
  )
}
