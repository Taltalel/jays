import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { venues } from "@/content/venues";

const tones = ["church", "riot", "view", "coast", "night", "beach"] as const;

/**
 * Instagram feed. TODO: wire a lightweight live embed (Behold / official
 * Instagram embed) pulling the venue accounts. Tiles below are placeholders
 * that link out to each venue's real account until the feed is connected.
 */
export function InstagramFeed() {
  const handles = venues.map((v) => v.instagram);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <Reveal className="mb-8 flex flex-col items-start gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-3">The Feed</p>
          <h2 className="h2-display text-champagne">The night, as it happens.</h2>
        </div>
        <p className="text-sm text-sage">
          Follow along —{" "}
          {handles.slice(0, 3).map((h, i) => (
            <span key={h.handle}>
              <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light">
                {h.handle}
              </a>
              {i < 2 ? " · " : ""}
            </span>
          ))}
        </p>
      </Reveal>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
        {tones.map((tone, i) => {
          const handle = handles[i % handles.length];
          return (
            <Reveal key={i} delay={(i % 6) * 40}>
              <a
                href={handle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-sm"
                aria-label={`Instagram — ${handle.handle}`}
              >
                <Placeholder tone={tone} seed={`ig-${i}`} showLabel={false} className="venue-card__img absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]" />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-forest-deep/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-champagne" style={{ fontFamily: "var(--font-label)" }}>
                    {handle.handle}
                  </span>
                </span>
              </a>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="text-[10px] uppercase tracking-[0.15em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
          TODO · connect the live Instagram feed
        </span>
      </p>
    </section>
  );
}
