import { Activity } from "lucide-react"

export function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5 text-xl font-bold tracking-tight no-underline">
      <span
        aria-hidden="true"
        className="grid size-[30px] place-items-center rounded-md bg-linear-135 from-primary to-brand-secondary text-white"
      >
        <Activity className="size-4" strokeWidth={2.5} />
      </span>
      Jeovely
      <span className="sr-only"> home</span>
    </a>
  )
}
