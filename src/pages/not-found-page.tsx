import { Link } from "react-router"

import { useDocumentTitle } from "@/hooks/use-document-title"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export function NotFoundPage() {
  useDocumentTitle("Page not found · Jeovely")
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4">
      <main id="main" className="flex flex-col items-center text-center">
        <Logo to="/" />
        <p className="mt-10 text-[0.8rem] font-bold tracking-[0.1em] text-primary uppercase">404</p>
        <h1 className="mt-2 text-[clamp(1.75rem,3vw,2.3rem)] leading-[1.15] font-bold">We couldn't find that page</h1>
        <p className="mt-3 text-muted-foreground">The link may be broken, or the page may have moved.</p>
        <Button asChild variant="cta" size="xl" className="mt-8">
          <Link to="/">Back to Jeovely</Link>
        </Button>
      </main>
    </div>
  )
}
