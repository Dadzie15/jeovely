import type { ReactNode } from "react"
import { CircleAlert, Info } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Form-level message. "error" is announced immediately (role="alert");
 * "info" politely (role="status").
 */
export function FormAlert({ tone, children }: { tone: "error" | "info"; children: ReactNode }) {
  const Icon = tone === "error" ? CircleAlert : Info
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3 text-sm font-medium",
        tone === "error"
          ? "border-destructive/30 bg-destructive/8 text-destructive dark:text-red-400"
          : "border-primary/25 bg-primary/8 text-primary-strong"
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
