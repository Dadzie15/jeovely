import { useMemo } from "react"
import { LiquidMetal, liquidMetalPresets } from "@paper-design/shaders-react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

export interface LiquidMetalTheme {
  colorBack: string
  colorTint: string
}

export interface LiquidMetalBackdropProps {
  light: LiquidMetalTheme
  dark: LiquidMetalTheme
  /** Pauses the animation (e.g. when the hero is scrolled out of view). */
  paused?: boolean
  className?: string
}

// The full-screen "Backdrop" preset from paper-design, used as the base.
const backdropPreset =
  liquidMetalPresets.find((preset) => preset.name === "Backdrop") ?? liquidMetalPresets[0]

/**
 * Full-bleed LiquidMetal shader. Kept in its own module so it can be
 * lazy-loaded and never blocks the first paint of the hero.
 */
export default function LiquidMetalBackdrop({ light, dark, paused = false, className }: LiquidMetalBackdropProps) {
  const isDark = useMediaQuery("(prefers-color-scheme: dark)")
  const isMobile = useMediaQuery("(max-width: 767px)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  const theme = isDark ? dark : light
  // Reduced motion renders a still frame; off-screen it stops animating.
  const speed = reducedMotion || paused ? 0 : isMobile ? 0.35 : 0.5

  const params = useMemo(
    () => ({
      ...backdropPreset.params,
      ...theme,
      speed,
      scale: isMobile ? 1.6 : 1.2,
      softness: 0.2,
      distortion: 0.08,
      contour: 0.3,
      // Mostly red-channel dispersion: warm (orange) fringes on blue metal, no full rainbow.
      shiftRed: 0.3,
      shiftBlue: 0.1,
      angle: 70,
    }),
    [theme, speed, isMobile]
  )

  return (
    <LiquidMetal
      {...params}
      // Cap the canvas resolution; a soft backdrop doesn't need full DPR.
      minPixelRatio={1}
      maxPixelCount={isMobile ? 420_000 : 1_600_000}
      className={cn("absolute inset-0 size-full", className)}
    />
  )
}
