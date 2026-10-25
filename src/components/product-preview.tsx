import type { LucideIcon } from "lucide-react"
import { FileText, MessageSquare, Sparkles } from "lucide-react"

const steps: { icon: LucideIcon; title: string; meta: string; live?: boolean }[] = [
  { icon: FileText, title: "New form submission", meta: "Trigger · Typeform", live: true },
  { icon: Sparkles, title: "Score & enrich lead", meta: "Action · Flowly AI" },
  { icon: MessageSquare, title: "Notify #sales channel", meta: "Action · Slack" },
]

const stats = [
  { value: "12,480", label: "Runs this month" },
  { value: "99.98%", label: "Success rate" },
  { value: "214h", label: "Time saved" },
]

/** Illustrative dashboard: one image for assistive tech, decorative internals. */
export function ProductPreview() {
  return (
    <div
      role="img"
      aria-label="Flowly dashboard showing an automated workflow from a new form submission to a Slack notification"
      className="glass overflow-hidden rounded-xl shadow-xl"
    >
      <div aria-hidden="true">
        <div className="flex gap-1.5 border-b border-glass-border px-4 py-3">
          {[0, 1, 2].map((i) => (
            <i key={i} className="size-2.5 rounded-full bg-border" />
          ))}
        </div>
        <div className="grid gap-3 p-6">
          {steps.map(({ icon: Icon, title, meta, live }, i) => (
            <div key={title}>
              {i > 0 && <div className="mb-3 ml-[31px] h-3.5 w-0.5 bg-border" />}
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3.5 shadow-sm">
                <span className="grid size-9 flex-none place-items-center rounded-[10px] bg-muted text-primary">
                  <Icon className="size-[18px]" />
                </span>
                <div>
                  <strong className="block text-[0.95rem]">{title}</strong>
                  <small className="text-muted-foreground">{meta}</small>
                </div>
                {live && (
                  <span className="ml-auto rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-success">
                    Live
                  </span>
                )}
              </div>
            </div>
          ))}
          <div className="mt-1 grid grid-cols-2 gap-3 min-[421px]:grid-cols-3">
            {stats.map((stat, i) => (
              <div key={stat.label} className={i === 2 ? "rounded-lg bg-muted p-3 max-[420px]:col-span-2" : "rounded-lg bg-muted p-3"}>
                <b className="block text-[1.2rem] font-bold">{stat.value}</b>
                <span className="text-[0.8rem] text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
