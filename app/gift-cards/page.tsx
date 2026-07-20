import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { venueParam } from "@/lib/analytics";
import { venues } from "@/content/venues";

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "Give a night at Room 7 — gift cards for Jay's, Naked Taco, HighBar and Riviera.",
  alternates: { canonical: "https://room7hospitality.com/gift-cards/" },
};

export default function GiftCardsPage() {
  return (
    <>
      <PageHero
        eyebrow="Gift Cards"
        title="Give the night."
        sub="Every room sells its own. Pick one and you'll head straight there to buy."
        tone="church"
        placeholder="A candlelit table set for two"
        image="/venues/jays-cocktail.webp"
        imagePosition="50% 40%"
        short
      />

      <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {venues.map((v, i) => (
            <Reveal key={v.slug} delay={(i % 2) * 60}>
              <TrackedLink
                href={v.website.url}
                event="gift_card_click"
                params={{ venue: venueParam(v.slug) }}
                className="group flex items-center justify-between rounded-sm border border-champagne/10 bg-forest/40 p-6 transition-colors hover:border-gold/40"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>{v.nickname}</p>
                  <h2 className="mt-1 font-display text-2xl text-champagne">{v.name}</h2>
                  <p className="mt-1 text-xs text-sage">{v.website.label}</p>
                </div>
                <span className="shrink-0 text-[12px] uppercase tracking-[0.15em] text-champagne/80 group-hover:text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  Buy ↗
                </span>
              </TrackedLink>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-sm text-sage">
          Gift cards are purchased directly through each room. HighBar shares Naked Taco&apos;s, at 1111 Collins Avenue.
        </p>
      </section>
    </>
  );
}
