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
  // showLabel is retained in the prop type for call-site compatibility; the
  // former dev "TODO" caption chip has been removed.
  style,
  src,
  alt,
  objectPosition = "center",
  priority = false,
}: {
  tone?: Tone;
  /** What the shot should be — describe the intended photograph. */
  label?: string;
  seed?: string;
  className?: string;
  showLabel?: boolean;
  style?: CSSProperties;
  /** Real photograph. When set, the gradient stand-in is replaced by the image. */
  src?: string;
  alt?: string;
  /** CSS object-position for the crop focal point. */
  objectPosition?: string;
  /** Eager-load (above-the-fold heroes). */
  priority?: boolean;
}) {
  // Real photography path. Note: callers pass their own positioning (usually
  // `absolute inset-0`) via className, so we must NOT hardcode `relative` here
  // — a conflicting position class collapses the image in flex containers with
  // no definite height (e.g. the venue hero). Fall back to `relative` only when
  // the caller doesn't position it.
  if (src) {
    const positioned = /\b(absolute|fixed|relative)\b/.test(className ?? "");
    return (
      <div className={`h-full w-full overflow-hidden ${positioned ? "" : "relative"} ${className ?? ""}`} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? label ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition }}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      </div>
    );
  }

  const t = TONES[tone];
  const { x, y } = offsets(seed ?? label ?? tone);
  // Same guard as the image branch: when the caller already positions us
  // (e.g. `absolute inset-0`), don't also emit `relative` — the conflict
  // otherwise leaves the gradient in flow and shoves hero text off-centre.
  const positioned = /\b(absolute|fixed|relative)\b/.test(className ?? "");
  return (
    <div
      className={`h-full w-full overflow-hidden ${positioned ? "" : "relative"} ${className ?? ""}`}
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
    </div>
  );
}
