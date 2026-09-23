"use client"

import * as React from "react"

import { BillingFormDialog } from "@/components/billings/billing-form-dialog"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

export function NewBillingDialog() {
  const [open, setOpen] = React.useState(false)

  return (
    <BillingFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm" className="gap-2">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
          Novo Faturamento
        </Button>
      }
    />
  )
}
