import { Check, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export type SubmitState = "idle" | "submitting" | "success"

interface SubmitButtonProps {
  state: SubmitState
  idleLabel: string
  submittingLabel: string
  successLabel: string
}

/** Full-width CTA that shows progress and blocks re-submission while busy. */
export function SubmitButton({ state, idleLabel, submittingLabel, successLabel }: SubmitButtonProps) {
  const busy = state !== "idle"
  return (
    <Button type="submit" variant="cta" size="xl" className="w-full" disabled={busy} aria-busy={state === "submitting"}>
      {state === "submitting" && <LoaderCircle aria-hidden="true" className="size-[18px] animate-spin motion-reduce:animate-none" />}
      {state === "success" && <Check aria-hidden="true" className="size-[18px]" strokeWidth={3} />}
      {state === "submitting" ? submittingLabel : state === "success" ? successLabel : idleLabel}
    </Button>
  )
}
