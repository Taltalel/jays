import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";
import { releases, coverage, pressKit } from "@/content/press";
import { pressOutlets, boilerplate, group } from "@/content/group";

export const metadata: Metadata = {
  title: "Press, Buzz & releases",
  description:
    "Room 7 press releases, coverage and press kit. News from the Fort Lauderdale hospitality group behind Jay's, Naked Taco, HIGHBAR and Riviera.",
  alternates: { canonical: "https://room7hospitality.com/press/" },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function PressPage() {
  return (
    <>
      <PageHero
        eyebrow="Press"
        title="The buzz."
        sub="Releases, coverage and everything a newsroom needs, in one place, each on its own page."
        tone="church"
        placeholder="Press night, the room, lit and full"
        image="/venues/jays-hero.webp"
        imagePosition="50% 40%"
        short
      />

      {/* Releases */}
      <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <Reveal className="mb-8">
          <p className="eyebrow mb-3">Releases</p>
          <h2 className="h2-display text-champagne">Straight from the house.</h2>
        </Reveal>
        <ul className="flex flex-col">
          {releases.map((r, i) => (
            <Reveal as="li" key={r.slug} delay={i * 50}>
              {i > 0 && <span className="rule-gold my-2 block" aria-hidden="true" />}
              <Link href={`/press/${r.slug}`} className="group block py-6">
                <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  {fmt(r.date)}
                </p>
                <h3 className="mt-2 font-display text-2xl text-champagne transition-colors group-hover:text-gold md:text-3xl">
                  {r.title}
                </h3>
                <p className="measure mt-2 text-base text-sage">{r.dek}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-champagne/80 group-hover:text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  Read release <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Coverage / Buzz, shown only when there's real coverage to show */}
      {(coverage.length > 0 || pressOutlets.length > 0) && (
      <section className="border-y border-champagne/10 bg-forest/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal className="mb-10">
            <p className="eyebrow mb-3">Coverage</p>
            <h2 className="h2-display text-champagne">What they’re saying.</h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {coverage.map((c, i) => {
              const live = c.url.startsWith("http");
              const inner = (
                <>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>{c.outlet}</p>
                  <blockquote className="mt-4 font-display text-xl leading-snug text-champagne">“{c.quote}”</blockquote>
                  <p className="mt-4 text-sm text-sage">{c.headline}</p>
                  {live && (
                    <span className="mt-auto pt-4 text-[11px] uppercase tracking-[0.15em] text-champagne/60" style={{ fontFamily: "var(--font-label)" }}>Read ↗</span>
                  )}
                </>
              );
              const cls = "flex h-full flex-col rounded-sm border border-champagne/10 bg-forest-deep/60 p-6";
              return (
                <Reveal key={c.headline} delay={(i % 3) * 60}>
                  {live ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className={`${cls} transition-colors hover:border-gold/40`}>
                      {inner}
                    </a>
                  ) : (
                    <div className={cls}>{inner}</div>
                  )}
                </Reveal>
              );
            })}
          </div>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-80">
            {pressOutlets.map((o) => (
              <li key={o} className="font-display text-lg text-champagne/70">{o}</li>
            ))}
          </ul>
        </div>
      </section>
      )}

      {/* Press kit + contact */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="eyebrow mb-3">Press Kit</p>
            <h2 className="h2-display text-champagne">Everything you need.</h2>
            <ul className="mt-8 flex flex-col gap-4">
              {pressKit.map((k) => (
                <li key={k.label} className="flex items-baseline justify-between gap-6 border-b border-champagne/10 pb-4">
                  <span>
                    <span className="block font-display text-xl text-champagne">{k.label}</span>
                    <span className="text-sm text-sage">{k.note}</span>
                  </span>
                  <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.15em] text-gold/80" style={{ fontFamily: "var(--font-label)" }}>On request</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <CTA href={`mailto:${group.email}?subject=Press%20kit%20request%20, %20Room%207`} external analytics={{ event: "press_kit_request" }}>Request the kit</CTA>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <p className="eyebrow mb-3">Boilerplate</p>
            <h2 className="h2-display text-champagne">The house, in a paragraph.</h2>
            <p className="measure mt-6 text-base leading-relaxed text-sage">{boilerplate}</p>
            <div className="mt-8 rounded-sm border border-gold/20 bg-forest/40 p-6">
              <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>Media Contact</p>
              <p className="mt-2 font-display text-xl text-champagne">Room 7 Press Office</p>
              <a href={`mailto:${group.email}`} className="text-sage hover:text-gold">{group.email}</a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
