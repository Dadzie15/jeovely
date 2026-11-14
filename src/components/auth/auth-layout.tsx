import type { ReactNode } from "react"
import { ArrowLeft, Check, FileText, MessageSquare, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react"
import { Link } from "react-router"

import { Logo } from "@/components/logo"

interface AuthLayoutProps {
  title: string
  description: ReactNode
  children: ReactNode
  /** Line under the form, e.g. "Already have an account? Sign in". */
  footer: ReactNode
}

/**
 * Shared frame for /login and /register: the form on the left, and on large
 * screens a Jeovely brand panel on the right (same gradient + glass language
 * as the landing page's final CTA and product preview).
 */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="relative isolate flex flex-col overflow-hidden">
        {/* Soft brand glow behind the form; decorative. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-32 size-[420px] rounded-full bg-primary opacity-[0.07] blur-[90px]" />
          <div className="absolute -right-24 -bottom-48 size-[360px] rounded-full bg-cta opacity-[0.06] blur-[90px] lg:hidden" />
        </div>

        <header className="flex h-[68px] items-center justify-between px-4 sm:px-8 lg:px-12">
          <Logo to="/" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to site
          </Link>
        </header>

        <main id="main" className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 md:py-14">
          <div className="w-full max-w-[440px]">
            <div className="rounded-xl border bg-card/80 p-6 shadow-lg backdrop-blur-sm sm:p-9 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
              <h1 className="text-[clamp(1.75rem,3vw,2.15rem)] leading-[1.15] font-bold">{title}</h1>
              <p className="mt-2.5 text-[1.0125rem] text-muted-foreground">{description}</p>
              <div className="mt-8">{children}</div>
            </div>
            <p className="mt-6 text-center text-[0.95rem] text-muted-foreground lg:text-left">{footer}</p>
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 pb-6 text-xs text-muted-foreground sm:px-8 lg:justify-start lg:px-12">
          <ShieldCheck aria-hidden="true" className="size-4 text-success" />
          Protected sign-in · Passwords are hashed, never stored in plain text
        </footer>
      </div>

      <BrandPanel />
    </div>
  )
}

const steps: { icon: LucideIcon; title: string; meta: string }[] = [
  { icon: FileText, title: "New form submission", meta: "Trigger · Typeform" },
  { icon: Sparkles, title: "Score & enrich lead", meta: "Action · Jeovely AI" },
  { icon: MessageSquare, title: "Notify #sales channel", meta: "Action · Slack" },
]

const highlights = ["Connect the tools you already use", "Launch your first workflow in 10 minutes", "Every run logged, retried and monitored"]

function BrandPanel() {
  return (
    <aside
      aria-label="About Jeovely"
      className="relative isolate hidden overflow-hidden bg-linear-135 from-[#1e40af] via-[#1d4ed8] via-55% to-[#2563eb] text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-center lg:px-14 lg:py-16 xl:px-20"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 -bottom-40 size-[440px] rounded-full bg-cta opacity-25 blur-[80px]" />
        <div className="absolute -top-48 -left-28 size-[460px] rounded-full bg-[#93c5fd] opacity-35 blur-[80px]" />
      </div>

      <div className="mx-auto w-full max-w-[520px]">
        <p className="text-[0.8rem] font-bold tracking-[0.1em] text-blue-100 uppercase">Team workflows</p>
        <h2 className="mt-3 text-[clamp(1.9rem,2.6vw,2.5rem)] leading-[1.15] font-bold">
          The busywork between your tools, handled.
        </h2>

        <ul className="mt-6 grid gap-3 text-blue-50">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-6 flex-none place-items-center rounded-full bg-white/15">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>

        {/* Illustrative workflow run (decorative; summarised for assistive tech). */}
        <div
          role="img"
          aria-label="A Jeovely workflow: a new form submission is scored and the sales channel is notified automatically"
          className="mt-10 rounded-xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-[16px]"
        >
          <div aria-hidden="true" className="grid gap-2.5">
            {steps.map(({ icon: Icon, title, meta }, i) => (
              <div key={title}>
                {i > 0 && <div className="mb-2.5 ml-[27px] h-3 w-0.5 bg-white/30" />}
                <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-3">
                  <span className="grid size-9 flex-none place-items-center rounded-[10px] bg-white/15">
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <strong className="block text-[0.95rem]">{title}</strong>
                    <small className="text-blue-100">{meta}</small>
                  </div>
                  <span className="ml-auto grid size-6 flex-none place-items-center rounded-full bg-white text-[#1d4ed8]">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                </div>
              </div>
            ))}
            <p className="mt-1.5 text-right text-xs font-medium text-blue-100">Completed in 1.4s · just now</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
