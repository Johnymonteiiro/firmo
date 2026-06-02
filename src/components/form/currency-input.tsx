"use client"

import { MaskedInput } from "@/components/ui/masked-input"

export interface CurrencyInputProps {
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  "aria-invalid"?: boolean
}

/** Campo de moeda BRL (máscara) que entrega o valor em ponto-decimal ("1500.00"). */
export function CurrencyInput({
  value,
  onChange,
  onBlur,
  placeholder = "0,00",
  "aria-invalid": ariaInvalid,
}: CurrencyInputProps) {
  return (
    <MaskedInput
      mask={Number}
      scale={2}
      thousandsSeparator="."
      radix=","
      mapToRadix={["."]}
      padFractionalZeros
      normalizeZeros
      unmask
      inputMode="decimal"
      placeholder={placeholder}
      value={value}
      onAccept={(v) => onChange(v)}
      onBlur={onBlur}
      aria-invalid={ariaInvalid}
    />
  )
}
