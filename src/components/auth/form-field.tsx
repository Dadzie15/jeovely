import { useState, type ComponentProps, type ReactNode } from "react"
import { CircleAlert, Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FieldProps extends Omit<ComponentProps<"input">, "id"> {
  id: string
  label: string
  error?: string
  /** Helper content under the input, linked with aria-describedby. */
  hint?: ReactNode
  /** Right-aligned content on the label row, e.g. a "Forgot password?" link. */
  labelAside?: ReactNode
}

/** Label + input + hint + error, wired together for screen readers. */
export function FormField({ id, label, error, hint, labelAside, className, ...props }: FieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} labelAside={labelAside}>
      <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} className={className} {...props} />
    </FieldShell>
  )
}

/** A password field with a show/hide toggle. The toggle never submits the form. */
export function PasswordField({ id, label, error, hint, labelAside, className, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} labelAside={labelAside}>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          // Keep the toggle from covering text; avoid auto-capitalising a visible password.
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={cn("pr-13", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
          disabled={props.disabled}
          className="absolute inset-y-1 right-1 grid w-11 place-items-center rounded-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-0 disabled:pointer-events-none disabled:opacity-50"
        >
          {visible ? <EyeOff aria-hidden="true" className="size-[18px]" /> : <Eye aria-hidden="true" className="size-[18px]" />}
        </button>
      </div>
    </FieldShell>
  )
}

function describedBy(id: string, hint: ReactNode, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined
}

function FieldShell({
  id,
  label,
  error,
  hint,
  labelAside,
  children,
}: Pick<FieldProps, "id" | "label" | "error" | "hint" | "labelAside"> & { children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {labelAside}
      </div>
      {children}
      {hint && (
        <div id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-destructive dark:text-red-400">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
