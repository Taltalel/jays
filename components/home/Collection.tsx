import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { collectionCards } from "@/content/venues";

/**
 * THE COLLECTION, the heart of the homepage, not a nav item.
 * Three destinations, four rooms. Jay's leads (flagship, full width); the
 * Collins Avenue card carries both Naked Taco (street) and HighBar (rooftop).
 */
export function Collection() {
  const jays = collectionCards.find((c) => c.key === "jays")!;
  const collins = collectionCards.find((c) => c.key === "collins")!;
  const riviera = collectionCards.find((c) => c.key === "riviera")!;

  return (
    <section id="collection" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <Reveal className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-3">The Collection</p>
          <h2 className="h2-display text-champagne">Three destinations. Four rooms.</h2>
        </div>
        <p className="measure text-sm text-sage md:max-w-xs md:text-right">
          Each room keeps its own soul, held together by one standard of hospitality.
        </p>
      </Reveal>

      {/* Flagship, full width */}
      <Reveal>
        <FeatureCard card={jays} tone="church" tall label="Jay's, the church, the night it comes alive" />
      </Reveal>

      {/* Two-up */}
      <div className="mt-5 grid gap-5 md:mt-6 md:grid-cols-2">
        <Reveal>
          <FeatureCard
            card={collins}
            tone="riot"
            label="Naked Taco street level into the HighBar pool deck"
            twoStorey
          />
        </Reveal>
        <Reveal delay={80}>
          <FeatureCard card={riviera} tone="coast" label="Riviera, golden hour, oceanfront table" />
        </Reveal>
      </div>
    </section>
  );
}

function FeatureCard({
  card,
  tone,
  tall = false,
  twoStorey = false,
  label,
}: {
  card: (typeof collectionCards)[number];
  tone: "church" | "riot" | "view" | "coast";
  tall?: boolean;
  twoStorey?: boolean;
  label: string;
}) {
  return (
    <Link
      href={card.href}
      className="venue-card group relative block overflow-hidden rounded-sm"
      aria-label={`${card.title}, ${card.destination}`}
    >
      <div className={`relative w-full overflow-hidden ${tall ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[4/5] md:aspect-[4/3]"}`}>
        <Placeholder tone={tone} seed={card.key} label={label} src={card.image} alt={`${card.title}, ${card.destination}`} showLabel={!card.image} sizes="(min-width: 768px) 50vw, 100vw" className="venue-card__img absolute inset-0" />
      </div>

      {/* scrim behind text over photography, non-negotiable */}
      <div className="scrim pointer-events-none absolute inset-0" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 md:p-8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
          {card.kicker} · {card.destination}
        </p>
        <h3 className="font-display text-3xl leading-none text-champagne md:text-5xl">{card.title}</h3>
        {/* gold hairline draws in on hover, beneath the name */}
        <span className="venue-card__rule mt-1 block h-px w-24 bg-gold" aria-hidden="true" />
        <p className="mt-2 max-w-md text-sm text-champagne/85 md:text-base">{card.descriptor}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-champagne transition-colors group-hover:text-gold"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Discover
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </span>

          {twoStorey && card.secondaryHref && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-sage"
              style={{ fontFamily: "var(--font-label)" }}
            >
              <span aria-hidden="true">↑</span> Rooftop: HighBar
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
