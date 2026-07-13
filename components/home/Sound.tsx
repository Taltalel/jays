import { Reveal } from "@/components/ui/Reveal";

/**
 * The Sound of Room 7 — a playlist. Riviera Dining Group does "Discover Our
 * Music"; nobody in Fort Lauderdale does. Cheap to build, memorable, on-brand.
 * TODO: drop in the live Spotify/Apple Music embed URL for the Room 7 playlist.
 */
export function Sound() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <p className="eyebrow mb-4">The Sound of Room 7</p>
          <h2 className="h2-display text-champagne">The night has a soundtrack.</h2>
          <p className="measure mt-6 text-base text-sage md:text-lg">
            Old-world swing that shouldn&apos;t work over a modern bassline — and does. The
            playlist we build the rooms around. Press play; you&apos;ll get the idea before you
            get the reservation.
          </p>
        </Reveal>

        <Reveal delay={80}>
          {/* Embed placeholder — styled like a player until the real embed lands */}
          <div className="relative overflow-hidden rounded-md border border-gold/20 bg-forest/60 p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-emerald">
                <span className="font-display text-2xl text-gold">7</span>
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-xl text-champagne">Room 7 · After Dark</p>
                <p className="text-[11px] uppercase tracking-[0.15em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
                  A Room 7 playlist
                </p>
              </div>
              <span className="ml-auto flex items-end gap-1" aria-hidden="true">
                {[10, 18, 8, 22, 14].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-gold/70"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-sm border border-dashed border-gold/30 bg-forest-deep/50 px-4 py-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-champagne/70" style={{ fontFamily: "var(--font-label)" }}>
                TODO · embed the live Room 7 Spotify playlist here
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
