/** Where signed-in users land when no (valid) destination was requested. */
export const DEFAULT_AUTHENTICATED_PATH = "/dashboard"

/** Query parameter that carries the originally requested page through sign-in. */
export const REDIRECT_PARAM = "next"

const AUTH_PAGES = new Set(["/login", "/register"])

/**
 * Returns `target` only if it is a same-origin, in-app path; otherwise the
 * default. This blocks open redirects such as "https://evil.example",
 * "//evil.example", "/\\evil.example" and "javascript:..." — anything the
 * browser would resolve to another origin or a non-HTTP scheme.
 */
export function safeRedirectPath(target: string | null | undefined, fallback = DEFAULT_AUTHENTICATED_PATH): string {
  if (!target) return fallback
  // Must be a root-relative path. Reject protocol-relative ("//") and
  // backslash tricks that some browsers normalise to "//". Also reject
  // control characters, which browsers strip before resolving.
  if (!target.startsWith("/") || target.startsWith("//") || target.includes("\\")) return fallback
  if (/[\u0000-\u001f\u007f]/.test(target)) return fallback

  let url: URL
  try {
    const base = "https://jeovely.invalid"
    url = new URL(target, base)
    if (url.origin !== base) return fallback
  } catch {
    return fallback
  }

  // Sending a freshly signed-in user back to a sign-in page would loop.
  if (AUTH_PAGES.has(url.pathname)) return fallback
  return `${url.pathname}${url.search}${url.hash}`
}

/** Link between /login and /register that keeps a valid ?next= destination. */
export function authPageLink(path: "/login" | "/register", searchParams: URLSearchParams): string {
  const next = searchParams.get(REDIRECT_PARAM)
  const safe = next ? safeRedirectPath(next, "") : ""
  return safe ? `${path}?${new URLSearchParams({ [REDIRECT_PARAM]: safe })}` : path
}

/** "/login?next=<current page>" for a location the user wasn't allowed to see. */
export function loginPathFor(location: { pathname: string; search: string; hash: string }): string {
  const next = `${location.pathname}${location.search}${location.hash}`
  if (safeRedirectPath(next, "") === "" || next === DEFAULT_AUTHENTICATED_PATH) return "/login"
  return `/login?${new URLSearchParams({ [REDIRECT_PARAM]: next })}`
}
