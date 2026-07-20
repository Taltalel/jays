import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";
import { founderTeaser, group } from "@/content/group";

/** The founder, split layout, portrait left, two sentences, two links. */
export function Founder() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm md:aspect-[3/4]">
            <Placeholder tone="night" seed="jay-portrait" src="/venues/jays-bar.webp" alt="Inside Jay's, the flagship room" objectPosition="50% 40%" showLabel={false} className="absolute inset-0" />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <p className="eyebrow mb-4">The Founder</p>
          <h2 className="h2-display text-champagne">{founderTeaser.name}</h2>
          <p className="mt-2 text-[13px] uppercase tracking-[0.15em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
            {founderTeaser.role}
          </p>
          <div className="measure mt-6 flex flex-col gap-4 text-base text-sage md:text-lg">
            {founderTeaser.lines.map((l) => (
              <p key={l} className="text-pretty">
                {l}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <CTA href="/about/jay-shirodkar">More on Jay</CTA>
            <CTA href={group.founder.site} external variant="text">
              jayshirodkar.com
            </CTA>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
