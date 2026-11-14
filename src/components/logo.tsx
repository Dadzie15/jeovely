import { Activity } from "lucide-react"
import { Link } from "react-router"

const className = "flex w-fit items-center gap-2.5 text-xl font-bold tracking-tight no-underline"

function Mark() {
  return (
    <>
      <span
        aria-hidden="true"
        className="grid size-[30px] place-items-center rounded-md bg-linear-135 from-primary to-brand-secondary text-white"
      >
        <Activity className="size-4" strokeWidth={2.5} />
      </span>
      Jeovely
      <span className="sr-only"> home</span>
    </>
  )
}

/** On the landing page it scrolls to the top ("#"); elsewhere pass `to` for an in-app link. */
export function Logo({ to }: { to?: string }) {
  if (to) {
    return (
      <Link to={to} className={className}>
        <Mark />
      </Link>
    )
  }
  return (
    <a href="#" className={className}>
      <Mark />
    </a>
  )
}
