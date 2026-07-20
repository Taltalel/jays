import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";
import { founderPage, pressOutlets } from "@/content/group";
import { venues } from "@/content/venues";

export const metadata: Metadata = {
  title: "Jay Shirodkar — Founder",
  description:
    "Jay Shirodkar is the founder of Room 7, the Fort Lauderdale hospitality group behind Jay's, Naked Taco, HighBar and Riviera. The story behind the house.",
  alternates: { canonical: "https://room7hospitality.com/about/jay-shirodkar/" },
};

export default function FounderPage() {
  return (
    <>
      {/* Hero portrait */}
      <section className="relative flex min-h-[80vh] w-full items-end overflow-hidden">
        <Placeholder tone="church" label="Jay Shirodkar — portrait" seed="founder-hero" src="/venues/jays-interior.webp" alt="Inside Jay's — the flagship room" objectPosition="50% 45%" priority className="absolute inset-0" />
        <div className="scrim absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 md:px-8 md:pb-20">
          <p className="eyebrow mb-4">{founderPage.role}</p>
          <h1 className="font-display text-6xl leading-[0.95] text-champagne md:text-8xl">{founderPage.name}</h1>
          <p className="measure mt-5 text-lg text-champagne/90 md:text-xl">{founderPage.lede}</p>
        </div>
      </section>

      {/* The story */}
      <section className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="eyebrow mb-6">The Story</p>
        </Reveal>
        <div className="measure flex flex-col gap-6">
          {founderPage.story.map((p, i) => (
            <Reveal key={i} delay={i * 60}>
              <p className={i === 0 ? "font-display text-2xl leading-snug text-champagne md:text-3xl" : "text-base text-sage md:text-lg"}>
                {p}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What he's built */}
      <section className="border-y border-champagne/10 bg-forest/40">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal className="mb-10 md:mb-14">
            <p className="eyebrow mb-3">What He’s Built</p>
            <h2 className="h2-display text-champagne">Four rooms and counting.</h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {venues.map((v, i) => (
              <Reveal key={v.slug} delay={(i % 4) * 50}>
                <Link href={`/collection/${v.slug}`} className="group block rounded-sm border border-champagne/10 bg-forest-deep/60 p-6 transition-colors hover:border-gold/40">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-gold" style={{ fontFamily: "var(--font-label)" }}>{v.nickname}</p>
                  <h3 className="mt-2 font-display text-2xl text-champagne">{v.name}</h3>
                  <p className="mt-3 text-sm text-sage">{v.descriptor}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Press about Jay */}
      <section className="mx-auto max-w-5xl px-5 py-20 text-center md:px-8 md:py-28">
        <Reveal>
          <p className="eyebrow mb-10">In the Press</p>
        </Reveal>
        <div className="flex flex-col gap-12">
          {founderPage.pressQuotes.map((q, i) => (
            <Reveal key={q.source} delay={i * 60}>
              <figure>
                <blockquote className="font-display text-balance text-2xl leading-snug text-champagne md:text-3xl">
                  “{q.quote}”
                </blockquote>
                <figcaption className="mt-4 text-[11px] uppercase tracking-[0.18em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  {q.source}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {pressOutlets.map((o) => (
            <li key={o} className="font-display text-lg text-champagne/70">{o}</li>
          ))}
        </ul>
      </section>

      {/* Links out */}
      <section className="border-t border-champagne/10 bg-forest-deep">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center md:py-24">
          <h2 className="h2-display text-champagne">More of Jay.</h2>
          <p className="measure text-sm text-sage">This is the house’s view of its founder. For the rest — the family, the full story — head to his own corner of the internet.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {founderPage.links.map((l) => (
              <CTA key={l.url} href={l.url} external>{l.label}</CTA>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
