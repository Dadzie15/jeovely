import * as React from "react"
import { cn } from "@/lib/utils"

/** Text input (MASTER: Component Specs → Inputs): 16px text, 8px radius, blue focus ring. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-md border border-input bg-card px-4 text-base text-foreground shadow-xs transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground/80",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 focus-visible:outline-none",
        "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
