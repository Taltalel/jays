import { Placeholder } from "@/components/ui/Placeholder";

/**
 * HOME HERO — full-viewport. One line. A scroll cue. Nothing else.
 * The restraint IS the flex — no paragraph, no button stack.
 *
 * Background: an original stained-glass-inspired backdrop that leads with the
 * church (our most distinctive asset). TODO: swap for the hero video (muted,
 * autoplay, loop, poster first, < 3MB) or the Jay's stained-glass bar photo.
 */
export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <Placeholder tone="church" seed="hero" showLabel={false} className="absolute inset-0" />
        <StainedGlass />
        {/* scrim for legibility over photography — non-negotiable */}
        <div className="scrim-full absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="eyebrow mb-6">Fort Lauderdale · Miami Beach</p>
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

      {/* label the still, discreetly */}
      <span className="absolute bottom-4 right-4 z-10 hidden items-center gap-2 rounded-full border border-gold/25 bg-forest-deep/40 px-3 py-1 backdrop-blur-sm md:flex">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="text-[10px] uppercase tracking-[0.15em] text-champagne/70" style={{ fontFamily: "var(--font-label)" }}>
          TODO · hero film — Jay&apos;s stained-glass bar
        </span>
      </span>
    </section>
  );
}

/** Original stained-glass / cathedral-arch motif. Abstract, on-brand, ours. */
function StainedGlass() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.55] mix-blend-screen"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="pane-gold" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#d8be78" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c6a24c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pane-emerald" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1e4c34" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0f2417" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lead" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c6a24c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c6a24c" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* three tall pointed arches */}
      {[300, 600, 900].map((cx, i) => (
        <g key={cx} opacity={i === 1 ? 1 : 0.7}>
          <path
            d={`M${cx - 130} 720 L${cx - 130} 300 Q${cx} 90 ${cx + 130} 300 L${cx + 130} 720 Z`}
            fill={i === 1 ? "url(#pane-gold)" : "url(#pane-emerald)"}
            stroke="url(#lead)"
            strokeWidth="2"
          />
          <path
            d={`M${cx - 130} 300 Q${cx} 90 ${cx + 130} 300`}
            fill="none"
            stroke="url(#lead)"
            strokeWidth="2"
          />
          <line x1={cx} y1="150" x2={cx} y2="720" stroke="url(#lead)" strokeWidth="1.5" />
          <line x1={cx - 130} y1="460" x2={cx + 130} y2="460" stroke="url(#lead)" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  );
}
