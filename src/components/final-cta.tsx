import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="pb-16 md:pb-24">
      <Reveal className="page-container">
        {/* Gradient stops chosen so white text stays ≥ 4.5:1 under the glass panel */}
        <div className="relative isolate overflow-hidden rounded-3xl bg-linear-135 from-[#1e40af] via-[#1d4ed8] via-55% to-[#2563eb] shadow-xl">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-16 -bottom-44 size-[380px] rounded-full bg-cta opacity-25 blur-[70px]" />
            <div className="absolute -top-52 -left-32 size-[420px] rounded-full bg-[#93c5fd] opacity-35 blur-[70px]" />
          </div>
          <div className="m-6 rounded-xl border border-white/20 bg-white/10 px-6 py-12 text-center text-white backdrop-blur-[16px] md:m-12 md:px-8 md:py-16">
            <h2 id="cta-title" className="text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.15] font-bold">
              Ready to get your time back?
            </h2>
            <p className="mx-auto mt-3.5 max-w-[520px] text-[1.075rem] text-blue-50">
              Join thousands of teams who automate the boring stuff with Flowly.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="cta" size="xl">
                <a href="#pricing">Start free trial</a>
              </Button>
              <Button
                asChild
                variant="brand"
                size="xl"
                className="border-white/70 text-white hover:bg-white/12"
              >
                <a href="#">Book a demo</a>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
