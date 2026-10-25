import { Reveal } from "@/components/reveal"

export function Testimonial() {
  return (
    <section aria-label="Customer testimonial" className="py-16 md:py-24">
      <Reveal className="page-container">
        <figure className="mx-auto max-w-[780px] text-center">
          <blockquote className="text-[clamp(1.3rem,2.6vw,1.75rem)] leading-[1.45] font-semibold tracking-[-0.015em]">
            “Jeovely took about 20 hours of manual handoffs off our ops team every week. It’s the first automation tool our
            whole company actually uses.”
          </blockquote>
          <figcaption className="mt-6 flex items-center justify-center gap-3 text-muted-foreground">
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-full bg-linear-135 from-[#1d4ed8] to-[#2563eb] font-bold text-white"
            >
              MO
            </span>
            <span className="text-left">
              <strong className="block text-foreground">Maya Okafor</strong>
              Head of Operations, Lumen
            </span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  )
}
