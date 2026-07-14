/**
 * HOME HERO — full-viewport. One line. A scroll cue. Nothing else.
 *
 * The backdrop is an original etched gold line-illustration: one continuous
 * horizon that runs through all four rooms — the church (Jay's), palms &
 * string lights (Naked Taco), the rooftop pool (HighBar), and the coast
 * (Riviera) — sharing one ground line. Four rooms, one house, drawn as one.
 */
export function Hero() {
  return (
    <section className="hero-scene relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden">
      {/* Etched four-venue horizon */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 100% at 50% 12%, #163a24 0%, #0f2417 52%, #0b1a10 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(55% 42% at 50% 34%, rgba(216,190,120,0.16), transparent)" }}
        />
        <HeroHorizon />
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

/** The four-venue etched horizon. Gold line-art, drawn as one continuous scene. */
function HeroHorizon() {
  const label = { fontFamily: "var(--font-label)", fontSize: "11px", letterSpacing: "3px", fill: "var(--color-gold)", opacity: 0.85 } as const;
  return (
    <svg
      viewBox="0 0 1440 540"
      preserveAspectRatio="xMidYMax meet"
      className="hero-horizon absolute inset-x-0 bottom-0 h-[62%] w-full"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <g fill="none" stroke="var(--color-gold)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.92}>
        {/* ground line — the one house */}
        <line x1="60" y1="430" x2="1380" y2="430" strokeOpacity={0.55} />
        <line x1="60" y1="436" x2="1380" y2="436" strokeOpacity={0.22} />

        {/* JAY'S — the cathedral */}
        <g className="hz hz1" transform="translate(232,0)">
          <path d="M-70,430 L-70,250 L0,150 L70,250 L70,430" />
          <path d="M-70,250 L70,250" />
          <circle cx="0" cy="300" r="34" />
          <circle cx="0" cy="300" r="20" />
          <path d="M0,266 L0,334 M-34,300 L34,300 M-24,276 L24,324 M24,276 L-24,324" />
          <path d="M-18,430 L-18,370 Q0,348 18,370 L18,430" />
          <path d="M0,150 L0,120 M-10,132 L10,132" />
          <path d="M-70,430 L-70,300 L-96,300 L-96,430 M70,430 L70,300 L96,300 L96,430" />
        </g>

        {/* NAKED TACO — palms + string lights + awning */}
        <g className="hz hz2" transform="translate(560,0)">
          <path d="M-70,430 C-66,360 -70,318 -74,300" />
          <path d="M-74,300 C-96,286 -116,286 -128,296 M-74,300 C-100,296 -118,306 -128,320 M-74,300 C-52,286 -32,286 -20,296 M-74,300 C-48,296 -30,306 -20,320 M-74,300 C-78,282 -78,268 -74,256" />
          <path d="M70,430 C74,362 70,320 66,302" />
          <path d="M66,302 C44,288 24,288 12,298 M66,302 C40,298 22,308 12,322 M66,302 C88,288 108,288 120,298 M66,302 C92,298 110,308 120,322 M66,302 C62,284 62,270 66,258" />
          <path d="M-74,300 Q-4,352 66,302" strokeDasharray="0.5 26" />
          <circle cx="-52" cy="322" r="3" /><circle cx="-24" cy="336" r="3" /><circle cx="4" cy="340" r="3" /><circle cx="32" cy="334" r="3" /><circle cx="52" cy="322" r="3" />
          <path d="M-40,430 L-40,392 L40,392 L40,430 M-40,392 L-30,378 L30,378 L40,392" />
        </g>

        {/* HIGHBAR — sun + parasol + pool */}
        <g className="hz hz3" transform="translate(880,0)">
          <circle cx="8" cy="205" r="24" />
          <path d="M8,169 L8,158 M8,252 L8,241 M-28,205 L-39,205 M44,205 L55,205 M-14,179 L-22,171 M30,231 L38,239 M-14,231 L-22,239 M30,179 L38,171" strokeOpacity={0.8} />
          {/* parasol */}
          <path d="M-58,300 L-58,378" />
          <path d="M-98,306 Q-58,276 -18,306" />
          <path d="M-98,306 Q-88,320 -78,306 Q-68,320 -58,306 Q-48,320 -38,306 Q-28,320 -18,306" />
          <path d="M-58,276 L-58,268" />
          {/* pool + deck */}
          <path d="M-92,398 Q-72,388 -52,398 T-12,398 T28,398 T68,398 M-92,412 Q-72,402 -52,412 T-12,412 T28,412 T68,412" />
          <path d="M-98,430 L-98,398 L96,398 L96,430" />
        </g>

        {/* RIVIERA — waves + setting sun + sailboat */}
        <g className="hz hz4" transform="translate(1180,0)">
          <circle cx="0" cy="392" r="30" />
          <path d="M-54,392 L-40,392 M40,392 L54,392 M-48,372 L-38,378 M38,378 L48,372" strokeOpacity={0.7} />
          <path d="M-120,410 Q-100,400 -80,410 T-40,410 T0,410 T40,410 T80,410 T120,410" />
          <path d="M-120,424 Q-100,414 -80,424 T-40,424 T0,424 T40,424 T80,424 T120,424" strokeOpacity={0.5} />
          <path d="M70,392 L70,338 L106,392 Z M64,392 L64,352 L36,392 Z M58,392 L82,392 L75,404 L65,404 Z" />
        </g>
      </g>

      {/* room labels */}
      <g textAnchor="middle" style={label}>
        <text x="232" y="470">JAY&apos;S</text>
        <text x="560" y="470">NAKED TACO</text>
        <text x="822" y="470">HIGHBAR</text>
        <text x="1180" y="470">RIVIERA</text>
      </g>
    </svg>
  );
}
