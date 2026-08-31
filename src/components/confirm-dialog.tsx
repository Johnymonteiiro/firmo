"use client"

import { PendingLabel } from "@/components/form/pending-label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  /** Texto do botão enquanto executa (default: "Aguarde…"). */
  pendingLabel?: string
  destructive?: boolean
  isPending?: boolean
  onConfirm: () => void
}

/** Diálogo de confirmação reutilizável (ex.: arquivar). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  pendingLabel = "Aguarde…",
  destructive,
  isPending,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
          >
            <PendingLabel pending={isPending} pendingLabel={pendingLabel}>
              {confirmLabel}
            </PendingLabel>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
