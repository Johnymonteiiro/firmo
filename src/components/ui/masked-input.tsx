"use client"

import * as React from "react"
import { IMaskInput, type IMaskInputProps } from "react-imask"

import { inputClassName } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type MaskedInputProps = IMaskInputProps<HTMLInputElement> & {
  className?: string
}

function MaskedInput({ className, ...props }: MaskedInputProps) {
  return (
    <IMaskInput
      data-slot="input"
      className={cn(inputClassName, className)}
      {...props}
    />
  )
}

export { MaskedInput }
