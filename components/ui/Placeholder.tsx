import type { CSSProperties } from "react";

/**
 * On-brand photography placeholder. NEVER stock imagery — one stock photo
 * undoes the whole thing. These are candlelit, cinematic gradient stand-ins
 * that describe the shot we still need. Marked TODO. Swap for real WebP/AVIF
 * (people in the rooms, not empty rooms) when photography lands.
 */

type Tone = "church" | "riot" | "view" | "coast" | "night" | "beach";

const TONES: Record<Tone, { glow: string; base: string; accent: string }> = {
  // warm stained-glass candlelight
  church: { glow: "rgba(198,162,76,0.30)", base: "#0f2417", accent: "rgba(90,46,34,0.55)" },
  // hot, saturated riot
  riot: { glow: "rgba(216,190,120,0.26)", base: "#122b1a", accent: "rgba(90,46,34,0.35)" },
  // rooftop dusk over the ocean
  view: { glow: "rgba(216,190,120,0.34)", base: "#0f2417", accent: "rgba(30,76,52,0.5)" },
  // coastal golden hour
  coast: { glow: "rgba(216,190,120,0.30)", base: "#12301e", accent: "rgba(157,174,151,0.22)" },
  // deep candlelit night
  night: { glow: "rgba(198,162,76,0.22)", base: "#0c1c12", accent: "rgba(30,76,52,0.45)" },
  beach: { glow: "rgba(216,190,120,0.28)", base: "#123020", accent: "rgba(157,174,151,0.25)" },
};

// Deterministic glow position so we don't need Math.random (SSR-safe).
function offsets(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  const x = 20 + (h % 60);
  const y = 25 + ((h >> 4) % 45);
  return { x, y };
}

const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";

export function Placeholder({
  tone = "night",
  label,
  seed,
  className,
  showLabel = true,
  style,
}: {
  tone?: Tone;
  /** What the shot should be — describe the intended photograph. */
  label?: string;
  seed?: string;
  className?: string;
  showLabel?: boolean;
  style?: CSSProperties;
}) {
  const t = TONES[tone];
  const { x, y } = offsets(seed ?? label ?? tone);
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className ?? ""}`}
      style={{
        background: `radial-gradient(120% 90% at ${x}% ${y}%, ${t.glow} 0%, transparent 55%), radial-gradient(140% 120% at 80% 110%, ${t.accent} 0%, transparent 60%), linear-gradient(160deg, ${t.base} 0%, #0b1a10 100%)`,
        ...style,
      }}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {/* grain */}
      <span
        className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-40"
        style={{ backgroundImage: grain, backgroundSize: "180px 180px" }}
      />
      {/* candlelight vignette */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(130% 100% at 50% 30%, transparent 40%, rgba(11,26,16,0.75) 100%)" }}
      />
      {showLabel && label && (
        <span className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full border border-gold/30 bg-forest-deep/40 px-3 py-1 backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
          <span
            className="text-[10px] uppercase tracking-[0.15em] text-champagne/75"
            style={{ fontFamily: "var(--font-label)" }}
          >
            TODO · {label}
          </span>
        </span>
      )}
    </div>
  );
}
