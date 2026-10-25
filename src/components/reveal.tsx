import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

interface RevealProps {
  children: ReactNode
  /** Position in a group; each step adds 60ms of stagger. */
  index?: number
  className?: string
}

/**
 * Scroll-triggered entrance (MASTER: Motion → Stagger List):
 * opacity 0, scale .92, y 16 → final; 400ms, back.out(1.4)-style easing.
 * Wraps content in its own element so CSS hover transforms on the child
 * aren't overridden by the inline motion transform.
 */
export function Reveal({ children, index = 0, className }: RevealProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        opacity: { duration: 0.4, ease: "easeOut", delay: index * 0.06 },
        default: { duration: 0.4, ease: [0.34, 1.4, 0.64, 1], delay: index * 0.06 },
      }}
    >
      {children}
    </motion.div>
  )
}
