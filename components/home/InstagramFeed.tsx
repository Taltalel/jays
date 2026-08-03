import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { venues, venueBySlug } from "@/content/venues";

/**
 * The Feed, surfaces every venue's Instagram. Tiles use real venue imagery
 * and link to the matching account; the follow row lists all four rooms.
 * TODO: connect a live embed (Behold / official Instagram) to pull live posts
 *, needs an access token. Until then these route to each real profile.
 */

// Real imagery mapped to the account it belongs to.
const feed: { img?: string; slug: "jays" | "naked-taco" | "highbar" | "riviera"; tone: "church" | "riot" | "view" | "coast" }[] = [
  { img: "/venues/jays-interior.webp", slug: "jays", tone: "church" },
  { img: "/venues/naked-taco-hero.webp", slug: "naked-taco", tone: "riot" },
  { img: "/venues/highbar-hero.webp", slug: "highbar", tone: "view" },
  { img: "/venues/riviera-hero.webp", slug: "riviera", tone: "coast" },
  { img: "/venues/jays-cocktail.webp", slug: "jays", tone: "church" },
  { img: "/venues/jays-tomahawk.webp", slug: "jays", tone: "church" },
  { img: "/venues/jays-lobster.webp", slug: "jays", tone: "church" },
  { img: "/venues/jays-seafood.webp", slug: "jays", tone: "church" },
];

export function InstagramFeed() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <Reveal className="mb-8 md:mb-12">
        <p className="eyebrow mb-3">The Feed</p>
        <h2 className="h2-display text-champagne">The night, as it happens.</h2>
      </Reveal>

      {/* Follow the rooms, every account */}
      <Reveal>
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {venues.map((v) => (
            <a
              key={v.slug}
              href={v.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-w-0 items-center justify-between rounded-sm border border-champagne/10 bg-forest/40 px-5 py-4 transition-colors hover:border-gold/40"
            >
              <span className="min-w-0">
                <span className="block truncate font-display text-lg text-champagne">{v.name}</span>
                <span className="block truncate text-[11px] uppercase tracking-[0.14em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
                  {v.instagram.handle}
                </span>
              </span>
              <span className="ml-3 shrink-0 whitespace-nowrap text-[11px] uppercase tracking-[0.15em] text-champagne/80 group-hover:text-gold" style={{ fontFamily: "var(--font-label)" }}>
                Follow ↗
              </span>
            </a>
          ))}
        </div>
      </Reveal>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3">
        {feed.map((t, i) => {
          const v = venueBySlug(t.slug)!;
          return (
            <Reveal key={i} delay={(i % 4) * 40}>
              <a
                href={v.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-sm"
                aria-label={`Instagram, ${v.instagram.handle}`}
              >
                <Placeholder
                  tone={t.tone}
                  seed={`ig-${i}`}
                  src={t.img}
                  showLabel={false}
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="venue-card__img absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <span className="absolute inset-0 flex items-end overflow-hidden bg-gradient-to-t from-forest-deep/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="block min-w-0 truncate text-[10px] uppercase tracking-[0.14em] text-champagne" style={{ fontFamily: "var(--font-label)" }}>
                    {v.instagram.handle}
                  </span>
                </span>
              </a>
            </Reveal>
          );
        })}
      </div>

    </section>
  );
}
