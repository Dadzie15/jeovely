import { MotionConfig } from "framer-motion"

import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { TrustedBy } from "@/components/trusted-by"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonial } from "@/components/testimonial"
import { Pricing } from "@/components/pricing"
import { FinalCta } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function App() {
  return (
    // "user" makes every motion component honour prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only rounded-md bg-card px-4 py-2.5 shadow-lg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <Testimonial />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </MotionConfig>
  )
}
