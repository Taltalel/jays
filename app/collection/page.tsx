import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/ui/PageHero";
import { venues, type Venue } from "@/content/venues";

export const metadata: Metadata = {
  title: "The Collection",
  description:
    "Three destinations, four rooms. Jay's, Naked Taco, HighBar and Riviera — the Room 7 collection across Fort Lauderdale and Miami Beach.",
  alternates: { canonical: "https://room7hospitality.com/collection" },
};

const TONES: Record<Venue["slug"], "church" | "riot" | "view" | "coast"> = {
  jays: "church",
  "naked-taco": "riot",
  highbar: "view",
  riviera: "coast",
};

export default function CollectionPage() {
  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="Three destinations. Four rooms."
        sub="One house, four souls — a church, a riot, a rooftop and the coast. Each keeps its own character; all keep the same standard."
        tone="church"
        placeholder="The collection — a room alive at night"
        short
      />

      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-col gap-5 md:gap-6">
          {venues.map((v, i) => (
            <Reveal key={v.slug} delay={(i % 2) * 60}>
              <Link
                href={`/collection/${v.slug}`}
                className="venue-card group grid overflow-hidden rounded-sm border border-champagne/10 md:grid-cols-2"
              >
                <div className={`relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[340px] ${i % 2 ? "md:order-2" : ""}`}>
                  <Placeholder tone={TONES[v.slug]} seed={`idx-${v.slug}`} src={v.heroImage} alt={`${v.name} — ${v.nickname}`} showLabel={false} className="venue-card__img absolute inset-0" />
                  <div className="scrim absolute inset-0 md:hidden" />
                </div>
                <div className="flex flex-col justify-center gap-3 bg-forest/40 p-8 md:p-12">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                    {v.nickname} · {v.destination}
                  </p>
                  <h2 className="font-display text-4xl text-champagne md:text-5xl">{v.name}</h2>
                  <span className="venue-card__rule block h-px w-20 bg-gold" aria-hidden="true" />
                  <p className="measure text-base text-sage md:text-lg">{v.descriptor}</p>
                  <span
                    className="mt-2 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-champagne transition-colors group-hover:text-gold"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    Discover
                    <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
