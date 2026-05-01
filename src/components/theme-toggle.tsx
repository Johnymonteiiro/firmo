"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun01Icon, Moon02Icon } from "@hugeicons/core-free-icons"

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null
    if (stored) {
      setTheme(stored)
      document.documentElement.classList.toggle("dark", stored === "dark")
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
      document.documentElement.classList.add("dark")
    }
  }, [])

  function toggle() {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    document.documentElement.classList.toggle("dark", next === "dark")
    localStorage.setItem("theme", next)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggle}>
          {theme === "light" ? (
            <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} className="size-5" />
          ) : (
            <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} className="size-5" />
          )}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Alternar tema</TooltipContent>
    </Tooltip>
  )
}
