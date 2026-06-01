"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: React.ReactNode
  title: string
  formId: string
  onSubmit: React.FormEventHandler<HTMLFormElement>
  isPending?: boolean
  errorMessage?: string | null
  submitLabel?: string
  /** Itens do form (grid de 2 colunas). */
  children: React.ReactNode
  contentClassName?: string
}

/** Shell consistente de dialog de formulário (header + grid rolável + rodapé + erro). */
export function FormDialog({
  open,
  onOpenChange,
  trigger,
  title,
  formId,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel = "Salvar",
  children,
  contentClassName,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "flex h-140 w-220 max-w-[95vw] flex-col p-12 sm:max-w-[95vw]",
          contentClassName
        )}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto pr-1"
        >
          <div className="grid grid-cols-2 gap-4 py-2">{children}</div>
        </form>

        {errorMessage && (
          <p className="shrink-0 text-sm text-destructive">{errorMessage}</p>
        )}

        <DialogFooter className="shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? "Salvando..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
