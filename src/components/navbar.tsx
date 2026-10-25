import { useEffect, useRef, useState } from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Escape closes the menu and returns focus to the toggle.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0 border-b-border">
      <div className="page-container flex h-[68px] items-center justify-between">
        <Logo />

        <nav aria-label="Primary" className="max-md:hidden">
          <ul className="flex gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href="#"
            className="px-3 py-2.5 font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground max-md:hidden"
          >
            Log in
          </a>
          <Button asChild variant="cta" className="max-[420px]:px-3.5">
            <a href="#pricing">Start free trial</a>
          </Button>
          <Button
            ref={toggleRef}
            variant="outline"
            size="icon"
            className="size-11 bg-card md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!open}
        className="absolute inset-x-0 top-[68px] border-b bg-card px-4 pt-2 pb-4 shadow-lg md:hidden"
      >
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="block py-3 font-medium" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#" className="block py-3 font-medium" onClick={() => setOpen(false)}>
              Log in
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
