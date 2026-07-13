import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { venues } from "@/content/venues";

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "Give a night at Room 7 — gift cards for Jay's, Naked Taco, HighBar and Riviera.",
  alternates: { canonical: "https://room7hospitality.com/gift-cards" },
};

export default function GiftCardsPage() {
  return (
    <>
      <PageHero
        eyebrow="Gift Cards"
        title="Give the night."
        sub="The easiest way to be someone's favourite person. Pick a room; we'll handle the rest."
        tone="church"
        placeholder="A candlelit table set for two"
        short
      />

      <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {venues.map((v, i) => (
            <Reveal key={v.slug} delay={(i % 2) * 60}>
              <a
                href={v.website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-sm border border-champagne/10 bg-forest/40 p-6 transition-colors hover:border-gold/40"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>{v.nickname}</p>
                  <h2 className="mt-1 font-display text-2xl text-champagne">{v.name}</h2>
                </div>
                <span className="text-[12px] uppercase tracking-[0.15em] text-champagne/80 group-hover:text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  Buy ↗
                </span>
              </a>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
            TODO · wire each button to the venue’s Toast / gift-card link
          </span>
        </p>
      </section>
    </>
  );
}
