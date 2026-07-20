import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { venues, type Venue } from "@/content/venues";

const TONES: Record<Venue["slug"], "church" | "riot" | "view" | "coast"> = {
  jays: "church",
  "naked-taco": "riot",
  highbar: "view",
  riviera: "coast",
};

/** NEXT ROOM, cross-link the other rooms to keep users on-site. */
export function NextRooms({ current }: { current: Venue["slug"] }) {
  const others = venues.filter((v) => v.slug !== current);
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <Reveal className="mb-8 md:mb-12">
        <p className="eyebrow mb-3">Next Room</p>
        <h2 className="h2-display text-champagne">The house has more.</h2>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-3">
        {others.map((v, i) => (
          <Reveal key={v.slug} delay={i * 60}>
            <Link href={`/collection/${v.slug}`} className="venue-card group relative block overflow-hidden rounded-sm">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Placeholder tone={TONES[v.slug]} seed={`next-${v.slug}`} src={v.heroImage} alt={`${v.name}, ${v.nickname}`} showLabel={false} className="venue-card__img absolute inset-0" />
                <div className="scrim absolute inset-0" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  {v.nickname}
                </p>
                <h3 className="font-display text-2xl text-champagne">{v.name}</h3>
                <span className="venue-card__rule mt-1 block h-px w-16 bg-gold" aria-hidden="true" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
