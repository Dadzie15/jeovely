import type { ComponentProps } from "react"
import { Link } from "react-router"

type AppLinkProps = Omit<ComponentProps<"a">, "href"> & { href: string }

/**
 * Renders a client-side router <Link> for in-app paths ("/register") and a
 * plain <a> for in-page anchors ("#pricing") or external URLs. Lets data-driven
 * CTAs mix both without each component knowing which is which. Works with
 * <Button asChild>, which passes its classes through.
 */
export function AppLink({ href, ...props }: AppLinkProps) {
  if (href.startsWith("/") && !href.startsWith("//")) return <Link to={href} {...props} />
  return <a href={href} {...props} />
}
