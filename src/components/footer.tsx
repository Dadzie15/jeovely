import { Logo } from "@/components/logo"

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
]

export function Footer() {
  return (
    <footer className="border-t py-12 text-[0.9rem] text-muted-foreground">
      <div className="page-container flex flex-wrap items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-6">
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="transition-colors duration-200 hover:text-foreground">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p>© 2026 Flowly, Inc.</p>
      </div>
    </footer>
  )
}
