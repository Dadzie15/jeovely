import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

// Unmount rendered trees between tests (vitest globals are off, so RTL can't auto-register this).
afterEach(() => cleanup())

// jsdom doesn't implement these browser APIs; React Router's ScrollRestoration
// and the landing page's media queries call them.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
// framer-motion's whileInView (landing page reveals) needs IntersectionObserver.
if (typeof window.IntersectionObserver === "undefined") {
  class NoopIntersectionObserver {
    readonly root = null
    readonly rootMargin = ""
    readonly thresholds = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  window.IntersectionObserver = NoopIntersectionObserver as unknown as typeof IntersectionObserver
}
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
