import { ArrowRight } from "lucide-react"

import { LiquidMetalHero } from "@/components/ui/liquid-metal-hero"
import { ProductPreview } from "@/components/product-preview"

export function Hero() {
  return (
    <LiquidMetalHero
      badge={
        <>
          <span aria-hidden="true" className="size-2 rounded-full bg-green-600" />
          New: AI-suggested workflows
        </>
      }
      title={
        <>
          Team workflows that <span className="text-primary">run themselves.</span>
        </>
      }
      subtitle="Jeovely connects the tools your team already uses and automates the busywork in between, so you spend your day shipping, not copy-pasting."
      primaryCta={{
        label: "Start free trial",
        href: "#pricing",
        icon: <ArrowRight aria-hidden="true" className="size-[18px]" />,
      }}
      secondaryCta={{ label: "See how it works", href: "#how" }}
      note="Free for 14 days · No credit card required"
      features={[
        { title: "20h", description: "saved per team, every week" },
        { title: "10 min", description: "to launch your first workflow" },
        { title: "99.98%", description: "uptime across every run" },
      ]}
      visual={<ProductPreview />}
    />
  )
}
