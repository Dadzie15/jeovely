import { useState } from "react"
import { LoaderCircle, LogOut, Workflow } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { FormAlert } from "@/components/auth/form-alert"

/**
 * Minimal signed-in placeholder used to exercise route protection and sign-out.
 * The real dashboard is a separate stage.
 */
export function DashboardPage() {
  useDocumentTitle("Dashboard · Jeovely")
  const { user, logout } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSignOut() {
    if (signingOut) return
    setSigningOut(true)
    setError(null)
    try {
      await logout()
      // ProtectedRoute now redirects to /login.
    } catch {
      setError("We couldn't sign you out. Check your connection and try again.")
      setSigningOut(false)
    }
  }

  const displayName = user?.name?.trim() || user?.email || "there"
  const firstName = displayName.split(" ")[0]

  return (
    <div className="min-h-dvh bg-background">
      <header className="glass sticky top-0 z-50 border-x-0 border-t-0 border-b-border">
        <div className="page-container flex h-[68px] items-center justify-between gap-4">
          <Logo to="/dashboard" />
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0 text-right max-sm:hidden">
              <p className="truncate text-sm font-semibold">{user?.name || user?.email}</p>
              {user?.name && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
            </div>
            <Button variant="outline" onClick={onSignOut} disabled={signingOut} aria-busy={signingOut} className="bg-card">
              {signingOut ? (
                <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
              ) : (
                <LogOut aria-hidden="true" />
              )}
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="page-container py-12 md:py-16">
        {error && (
          <div className="mb-6">
            <FormAlert tone="error">{error}</FormAlert>
          </div>
        )}
        <section aria-labelledby="dashboard-title" className="rounded-xl border bg-card p-8 shadow-md md:p-12">
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-lg bg-linear-135 from-primary to-brand-secondary text-white shadow-md"
          >
            <Workflow className="size-5" strokeWidth={2.5} />
          </span>
          <h1 id="dashboard-title" className="mt-6 text-[clamp(1.75rem,3vw,2.3rem)] leading-[1.15] font-bold">
            Welcome to Jeovely, {firstName}
          </h1>
          <p className="mt-3 max-w-[560px] text-[1.0125rem] text-muted-foreground">
            You're signed in. Your workspace and the workflow builder are on their way. This page is a placeholder
            until the dashboard ships.
          </p>
        </section>
      </main>
    </div>
  )
}
