import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"

interface Plan {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: { label: string; href: string }
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    period: "/ month",
    description: "For individuals getting started.",
    features: ["1,000 runs / month", "5 active workflows", "Core integrations"],
    cta: { label: "Get started", href: "#" },
  },
  {
    name: "Team",
    price: "$29",
    period: "/ user / month",
    description: "For teams automating together.",
    features: ["50,000 runs / month", "Unlimited workflows", "All 300+ integrations", "Jeovely AI assistant"],
    cta: { label: "Start free trial", href: "#" },
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations at scale.",
    features: ["Unlimited runs", "SSO & audit logs", "Dedicated success manager"],
    cta: { label: "Contact sales", href: "#" },
  },
]

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="pb-16 md:pb-24">
      <div className="page-container">
        <SectionHeading
          id="pricing-title"
          kicker="Pricing"
          title="Simple pricing that scales with you"
          description="Start free. Upgrade when your team is ready."
        />
        <ul className="mx-auto grid max-w-[460px] gap-6 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan, i) => (
            <li key={plan.name}>
              <Reveal index={i} className="h-full">
                <Card
                  className={cn(
                    "relative h-full gap-0 py-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0",
                    plan.featured && "border-2 border-primary shadow-xl"
                  )}
                >
                  {plan.featured && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 font-bold">Most popular</Badge>
                  )}
                  <CardHeader className="px-8">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="mt-4 text-[2.5rem] leading-none font-bold tracking-[-0.03em]">
                      {plan.price}
                      {plan.period && (
                        <span className="ml-1.5 text-base font-medium tracking-normal text-muted-foreground">{plan.period}</span>
                      )}
                    </p>
                    <p className="mt-2 text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 px-8">
                    <ul className="my-6 grid gap-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-[0.95rem]">
                          <Check aria-hidden="true" className="mt-0.5 size-4 flex-none text-primary" strokeWidth={3} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="px-8">
                    <Button asChild variant={plan.featured ? "cta" : "brand"} className="w-full">
                      <a href={plan.cta.href}>
                        {plan.cta.label}
                        <span className="sr-only"> — {plan.name} plan</span>
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
