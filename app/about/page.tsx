import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Standard } from "@/components/home/Standard";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";
import { Placeholder } from "@/components/ui/Placeholder";
import { manifesto, whyRoom7, founderTeaser, group } from "@/content/group";
import { venues } from "@/content/venues";

export const metadata: Metadata = {
  title: "About — Four rooms, one house",
  description:
    "Room 7 is the Fort Lauderdale hospitality group behind Jay's, Naked Taco, HighBar and Riviera. The group, the standard, and the story behind the name.",
  alternates: { canonical: "https://room7hospitality.com/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Four rooms. One house."
        sub={manifesto.hook}
        tone="night"
        placeholder="A room, half-lit — the house at rest"
      />

      {/* The group */}
      <section className="mx-auto max-w-4xl px-5 py-20 text-center md:px-8 md:py-28">
        <Reveal>
          <p className="measure mx-auto font-display text-2xl leading-snug text-champagne md:text-3xl">
            {manifesto.body}
          </p>
        </Reveal>
      </section>

      <Standard />

      {/* Why Room 7 */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal className="mb-12 max-w-2xl md:mb-16">
          <p className="eyebrow mb-3">Why “Room 7”</p>
          <h2 className="h2-display text-champagne">A name that sets the tone.</h2>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          {whyRoom7.map((w, i) => (
            <Reveal key={w.title} delay={i * 70}>
              <span className="font-display text-3xl text-gold/70">0{i + 1}</span>
              <h3 className="mt-3 font-display text-2xl text-champagne">{w.title}</h3>
              <span className="mt-3 block h-px w-16 bg-gold/50" aria-hidden="true" />
              <p className="mt-4 text-base text-sage">{w.line}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Founder teaser */}
      <section className="border-y border-champagne/10 bg-forest/40">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-28">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Placeholder tone="night" seed="about-jay" label="Jay Shirodkar — in one of the rooms" className="absolute inset-0" />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <p className="eyebrow mb-4">The Founder</p>
            <h2 className="h2-display text-champagne">{founderTeaser.name}</h2>
            <div className="measure mt-6 flex flex-col gap-4 text-base text-sage md:text-lg">
              {founderTeaser.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <div className="mt-8">
              <CTA href="/about/jay-shirodkar">The full story</CTA>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The house — four venues */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal className="mb-10 md:mb-14">
          <p className="eyebrow mb-3">The House</p>
          <h2 className="h2-display text-champagne">Four rooms, cross-town.</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {venues.map((v, i) => (
            <Reveal key={v.slug} delay={(i % 4) * 50}>
              <Link href={`/collection/${v.slug}`} className="group block rounded-sm border border-champagne/10 bg-forest/40 p-6 transition-colors hover:border-gold/40">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  {v.nickname}
                </p>
                <h3 className="mt-2 font-display text-2xl text-champagne">{v.name}</h3>
                <p className="mt-3 text-sm text-sage">{v.destination}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-champagne/10 bg-forest-deep">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center md:py-28">
          <h2 className="h2-display text-champagne">Come be part of the house.</h2>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <CTA href="/careers" variant="outline">Careers</CTA>
            <CTA href="/contact">Contact</CTA>
          </div>
          <p className="text-sm text-sage">{group.hq.street} · {group.hq.locality}</p>
        </div>
      </section>
    </>
  );
}
