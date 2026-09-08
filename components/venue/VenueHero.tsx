import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { CTA } from "@/components/ui/CTA";
import { venueParam } from "@/lib/analytics";
import type { Venue } from "@/content/venues";

const TONES: Record<Venue["slug"], "church" | "riot" | "view" | "coast"> = {
  jays: "church",
  "naked-taco": "riot",
  highbar: "view",
};

export function VenueHero({ venue, paired }: { venue: Venue; paired?: Venue }) {
  return (
    <section className="relative flex min-h-[86vh] w-full items-end overflow-hidden">
      <Placeholder
        tone={TONES[venue.slug]}
        label={`${venue.name}, the hero shot, alive at night`}
        seed={`${venue.slug}-hero`}
        src={venue.heroImage}
        alt={`${venue.name}, ${venue.nickname}`}
        objectPosition={venue.heroPosition}
        priority
        showLabel={!venue.heroImage}
        className="absolute inset-0"
      />
      <div className="scrim absolute inset-0" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 md:px-8 md:pb-20">
        {venue.flagship && (
          <p className="mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" /> Flagship
          </p>
        )}
        <p className="eyebrow mb-3">
          {venue.nickname} · {venue.destination}
        </p>
        <h1 className="font-display text-6xl leading-[0.95] text-champagne md:text-8xl">{venue.name}</h1>
        <p className="measure mt-5 text-lg text-champagne/90 md:text-xl">{venue.lede}</p>

        {paired && (
          <p className="mt-4 text-sm text-sage">
            {venue.slug === "highbar" ? "Downstairs: " : "Upstairs: "}
            <Link href={`/collection/${paired.slug}`} className="text-gold underline underline-offset-4">
              {paired.name}
            </Link>, same address, {venue.slug === "highbar" ? "street level" : "the rooftop"}.
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {venue.reservation && (
            <CTA href={venue.reservation.url} external variant="solid" analytics={{ event: "reservation_click", params: { venue: venueParam(venue.slug) } }}>
              Reserve
            </CTA>
          )}
          {venue.menuUrl && (
            <CTA href={venue.menuUrl} external variant="outline" analytics={{ event: "menu_click", params: { venue: venueParam(venue.slug) } }}>
              Menu
            </CTA>
          )}
          <CTA href={venue.website.url} external variant="text" analytics={{ event: "venue_site_click", params: { venue: venueParam(venue.slug) } }}>
            Visit site
          </CTA>
        </div>
      </div>
    </section>
  );
}
