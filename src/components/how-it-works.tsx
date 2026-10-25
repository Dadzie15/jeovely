import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"

const steps = [
  {
    title: "Connect your tools",
    description: "Sign in to your apps with one click. Flowly handles auth and keeps tokens secure.",
  },
  {
    title: "Describe the workflow",
    description: "Pick a template or tell Flowly AI what you need. It drafts the steps for you.",
  },
  {
    title: "Launch and relax",
    description: "Turn it on. Flowly runs 24/7, retries on failure and alerts you only when it matters.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-muted py-16 md:py-24">
      <div className="page-container">
        <SectionHeading id="how-title" kicker="How it works" title="From idea to automation in three steps" onMuted />
        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Reveal index={i}>
                <span
                  aria-hidden="true"
                  className="mb-4 grid size-11 place-items-center rounded-lg bg-primary font-bold text-primary-foreground shadow-md"
                >
                  {i + 1}
                </span>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
