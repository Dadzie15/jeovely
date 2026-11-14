import { LoaderCircle } from "lucide-react"

/** Shown while the initial GET /api/auth/me decides where the user belongs. */
export function AuthLoadingScreen() {
  return (
    <div role="status" aria-live="polite" className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-lg bg-linear-135 from-primary to-brand-secondary text-white shadow-md"
        >
          <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" strokeWidth={2.5} />
        </span>
        <p className="text-sm font-medium">Checking your session…</p>
      </div>
    </div>
  )
}
