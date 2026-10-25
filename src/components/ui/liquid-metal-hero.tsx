import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { LiquidMetalTheme } from "@/components/ui/liquid-metal-backdrop"

// The WebGL shader is split into its own chunk so the hero text paints first.
const LiquidMetalBackdrop = lazy(() => import("@/components/ui/liquid-metal-backdrop"))

export interface LiquidMetalHeroCta {
  label: string
  href: string
  icon?: ReactNode
}

export interface LiquidMetalHeroFeature {
  icon?: ReactNode
  title: string
  description: string
}

export interface LiquidMetalHeroProps {
  badge?: ReactNode
  title: ReactNode
  subtitle: ReactNode
  primaryCta: LiquidMetalHeroCta
  secondaryCta?: LiquidMetalHeroCta
  /** Small print under the CTAs. */
  note?: ReactNode
  features?: LiquidMetalHeroFeature[]
  /** Optional visual shown beside the copy on large screens (e.g. a product preview). */
  visual?: ReactNode
  /** Shader colours per colour scheme. */
  metal?: { light: LiquidMetalTheme; dark: LiquidMetalTheme }
  className?: string
}

// Jeovely palette (MASTER.md): pale trust-blue metal in light mode,
// deep navy with a primary-blue sheen in dark mode.
const defaultMetal = {
  light: { colorBack: "#b4cbf6", colorTint: "#ffffff" },
  dark: { colorBack: "#0f1b36", colorTint: "#3b82f6" },
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.4, 0.64, 1] },
  },
}

export function LiquidMetalHero({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  note,
  features,
  visual,
  metal = defaultMetal,
  className,
}: LiquidMetalHeroProps) {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(true)

  // Stop the shader's animation loop while the hero is off-screen.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={cn("relative isolate overflow-hidden", className)}
    >
      {/* Background: static brand glow underneath, liquid metal on top, then a wash for legibility */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-20 size-[520px] rounded-full bg-primary opacity-40 blur-[70px] dark:opacity-30" />
        <div className="absolute top-44 right-80 size-[380px] rounded-full bg-cta opacity-25 blur-[70px] dark:opacity-15" />
        <div className="absolute top-16 -left-48 size-[420px] rounded-full bg-brand-secondary opacity-25 blur-[70px]" />
        <Suspense fallback={null}>
          <LiquidMetalBackdrop
            light={metal.light}
            dark={metal.dark}
            paused={!inView}
            className="opacity-45 mix-blend-multiply dark:opacity-50 dark:mix-blend-screen"
          />
        </Suspense>
        <div className="absolute inset-0 bg-linear-to-r from-background/85 via-background/45 to-background/10 max-lg:bg-linear-to-b max-lg:from-background/80 max-lg:via-background/60 max-lg:to-background/80" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
      </div>

      <motion.div
        variants={containerVariants}
        initial={reduce ? false : "hidden"}
        animate="visible"
        className="page-container py-16 md:py-24"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            {badge && (
              <motion.div variants={itemVariants}>
                <Badge
                  variant="outline"
                  className="glass mb-6 gap-2 px-3.5 py-1.5 text-[0.85rem] font-semibold text-muted-foreground"
                >
                  {badge}
                </Badge>
              </motion.div>
            )}

            <motion.h1
              variants={itemVariants}
              className="text-[clamp(2.4rem,5vw,3.75rem)] leading-[1.1] font-bold tracking-[-0.025em]"
            >
              {title}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted-foreground"
            >
              {subtitle}
            </motion.p>

            <motion.div
              variants={containerVariants}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <motion.div variants={buttonVariants}>
                <Button asChild variant="cta" size="xl" className="w-full sm:w-auto">
                  <a href={primaryCta.href}>
                    {primaryCta.label}
                    {primaryCta.icon}
                  </a>
                </Button>
              </motion.div>
              {secondaryCta && (
                <motion.div variants={buttonVariants}>
                  <Button asChild variant="brand" size="xl" className="w-full sm:w-auto">
                    <a href={secondaryCta.href}>
                      {secondaryCta.label}
                      {secondaryCta.icon}
                    </a>
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {note && (
              <motion.p variants={itemVariants} className="mt-6 text-sm text-muted-foreground">
                {note}
              </motion.p>
            )}
          </div>

          {visual && <motion.div variants={itemVariants}>{visual}</motion.div>}
        </div>

        {features && features.length > 0 && (
          <motion.ul
            variants={containerVariants}
            className="mt-14 grid gap-4 md:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.li key={feature.title} variants={itemVariants}>
                <Card className="glass h-full gap-0 py-0 text-center shadow-md">
                  <CardContent className="px-6 py-7">
                    {feature.icon && (
                      <span aria-hidden="true" className="mx-auto mb-3 grid size-10 place-items-center rounded-lg bg-muted text-primary">
                        {feature.icon}
                      </span>
                    )}
                    <p className="text-[clamp(1.8rem,3vw,2.4rem)] leading-tight font-bold tracking-[-0.03em] text-primary">
                      {feature.title}
                    </p>
                    <p className="mt-1 font-medium text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>
    </section>
  )
}
