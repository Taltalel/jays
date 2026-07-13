/**
 * ROOM 7 wordmark — inline SVG so it renders with the site's own fonts.
 * The "7" is the ONLY element permitted a gold glow on hover.
 *
 * NOTE: This mirrors /public/brand/logo.svg (the deliverable asset). Both are
 * PLACEHOLDERS matching the brand-book spec until the final custom lettering
 * lands. Do not re-typeset the wordmark elsewhere — always reuse this.
 */

type LogoProps = {
  className?: string;
  /** Show the tagline + deco rule (full lockup) vs. just "Room 7". */
  withTagline?: boolean;
  title?: string;
};

export function Logo({ className, withTagline = true, title = "Room 7 — Elevated Hospitality" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 240 72"
      className={className}
      role="img"
      aria-label={title}
      style={{ overflow: "visible" }}
    >
      <g fill="var(--color-gold)">
        <text
          x="2"
          y="40"
          fontFamily="var(--font-display)"
          fontSize="42"
          fontWeight={500}
          letterSpacing="0.5"
        >
          Room
        </text>
        <text
          x="150"
          y="45"
          fontFamily="var(--font-display)"
          fontSize="54"
          fontWeight={500}
          className="logo-seven"
        >
          7
        </text>
      </g>
      {withTagline && (
        <>
          <g fill="var(--color-gold)">
            <rect x="30" y="54" width="180" height="1" opacity="0.9" />
            <path d="M24 54.5 l6 -4 l0 8 z" />
            <path d="M216 54.5 l-6 -4 l0 8 z" />
          </g>
          <text
            x="120"
            y="68"
            textAnchor="middle"
            fill="var(--color-gold)"
            fontFamily="var(--font-label)"
            fontSize="9"
            letterSpacing="4"
          >
            ELEVATED HOSPITALITY
          </text>
        </>
      )}
    </svg>
  );
}

export function Monogram({ className, title = "Room 7" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title} style={{ overflow: "visible" }}>
      <text
        x="24"
        y="39"
        textAnchor="middle"
        fill="var(--color-gold)"
        fontFamily="var(--font-display)"
        fontSize="48"
        fontWeight={500}
        className="logo-seven"
      >
        7
      </text>
    </svg>
  );
}
