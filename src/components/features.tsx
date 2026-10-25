import type { LucideIcon } from "lucide-react"
import { ChartLine, Link, ShieldCheck, Workflow } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Workflow,
    title: "Visual builder",
    description: "Drag, drop and connect steps. No code required, but there when you want it.",
  },
  {
    icon: Link,
    title: "300+ integrations",
    description: "Slack, Notion, HubSpot, GitHub, Stripe and every tool your team relies on.",
  },
  {
    icon: ChartLine,
    title: "Real-time insights",
    description: "Track every run, spot failures instantly and see exactly how much time you save.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise security",
    description: "SOC 2 Type II, SSO, audit logs and granular permissions out of the box.",
  },
]

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="py-16 md:py-24">
      <div className="page-container">
        <SectionHeading
          id="features-title"
          kicker="Features"
          title="Everything you need to automate with confidence"
          description="Build in minutes, scale to millions of runs, and always know what happened and why."
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }, i) => (
            <li key={title}>
              <Reveal index={i} className="h-full">
                <Card className="h-full gap-0 py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0">
                  <CardContent className="px-6 py-8">
                    <span aria-hidden="true" className="mb-6 grid size-11 place-items-center rounded-[10px] bg-muted text-primary">
                      <Icon className="size-[22px]" />
                    </span>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-[0.95rem] text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
