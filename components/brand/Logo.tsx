/* eslint-disable @next/next/no-img-element */
/**
 * ROOM 7 wordmark, the final custom lettering supplied by the client
 * (ornate "ROOM", integrated tall "7", "ELEVATED HOSPITALITY" between
 * diamond rules). Gold, keyed to a transparent background so it sits on any
 * dark section. Never re-typeset, always reuse this component / these assets.
 *
 *   /public/brand/logo.webp, full horizontal lockup
 *   /public/brand/monogram.webp, the "7" (scrolled header, mobile, favicon)
 *
 * The "7" is the only element permitted a gold glow on hover (.logo-seven).
 */

type LogoProps = {
  className?: string;
  /** kept for API compatibility; the supplied lockup always includes the tagline */
  withTagline?: boolean;
  title?: string;
};

export function Logo({ className, title = "Room 7, Elevated Hospitality" }: LogoProps) {
  return (
    <img
      src="/brand/logo.webp"
      alt={title}
      width={760}
      height={394}
      className={className}
      style={{ width: "auto" }}
      decoding="async"
    />
  );
}

export function Monogram({ className, title = "Room 7" }: { className?: string; title?: string }) {
  return (
    <img
      src="/brand/monogram.webp"
      alt={title}
      width={120}
      height={150}
      className={`logo-seven ${className ?? ""}`}
      style={{ width: "auto" }}
      decoding="async"
    />
  );
}
