import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Reveal } from "@/components/reveal"

interface SectionHeadingProps {
  id: string
  kicker: string
  title: ReactNode
  description?: ReactNode
  /** Use the stronger blue when the section sits on the muted background. */
  onMuted?: boolean
}

export function SectionHeading({ id, kicker, title, description, onMuted }: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto mb-16 max-w-[640px] text-center">
      <p
        className={cn(
          "text-[0.8rem] font-bold tracking-[0.1em] uppercase",
          onMuted ? "text-primary-strong" : "text-primary"
        )}
      >
        {kicker}
      </p>
      <h2 id={id} className="mt-2 text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.15] font-bold">
        {title}
      </h2>
      {description && <p className="mt-3.5 text-[1.075rem] text-muted-foreground">{description}</p>}
    </Reveal>
  )
}
