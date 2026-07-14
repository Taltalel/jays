import { Placeholder } from "@/components/ui/Placeholder";

/**
 * HOME HERO — full-viewport. One line. A scroll cue. Nothing else.
 * The restraint IS the flex — no paragraph, no button stack.
 *
 * Leads with the church — the Jay's stained-glass bar, our most distinctive
 * asset (brief: "put the stained-glass bar image above the fold"). A hero film
 * (muted, autoplay, loop, poster, < 3MB) can replace this still later.
 */
export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden">
      {/* Backdrop — the stained-glass bar at Jay's */}
      <div className="absolute inset-0">
        <Placeholder
          tone="church"
          seed="hero"
          src="/venues/jays-hero.webp"
          alt="Jay's — the stained-glass bar"
          objectPosition="30% 35%"
          priority
          showLabel={false}
          className="absolute inset-0"
        />
        {/* scrim for legibility over photography — non-negotiable */}
        <div className="scrim-full absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="eyebrow mb-6">South Florida</p>
        <h1 className="h1-hero text-champagne">
          Four rooms.
          <br />
          One house.
        </h1>
        <p className="mt-6 max-w-md text-balance text-base text-sage md:text-lg">
          Elevated hospitality in South Florida.
        </p>
      </div>

      {/* Scroll cue */}
      <a
        href="#statement"
        aria-label="Scroll to explore"
        className="group absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-champagne/60 transition-colors group-hover:text-gold" style={{ fontFamily: "var(--font-label)" }}>
          Enter
        </span>
        <span className="block h-10 w-px overflow-hidden bg-champagne/20">
          <span className="block h-4 w-px animate-[room-scrolldown_1.8s_ease-in-out_infinite] bg-gold" />
        </span>
      </a>
    </section>
  );
}
