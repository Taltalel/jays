/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * HOME HERO — a cinematic, layered composition over the gold engraving.
 *
 * Top to bottom: the Room 7 wordmark, ELEVATED HOSPITALITY, a gold diamond
 * rule, the "Four rooms. One house." statement, then the vintage-engraving
 * venue panorama fading up into the forest, and a scroll cue. Everything is
 * real, responsive HTML over the artwork — nothing is flattened into an image.
 *
 * The four venues in the engraving are keyboard-focusable links (Jay's, Naked
 * Taco, HighBar — Naked Taco's rooftop — and Riviera). Panorama parallax and
 * the atmospheric drift are motion-gated by prefers-reduced-motion.
 */

// Hotspots over the panorama. Positioned bottom-anchored (in %) so they stay
// aligned with the buildings as the artwork is object-cover cropped from the
// top on wide viewports. Tuned against the 1922×818 engraving.
const VENUES = [
  { slug: "jays", name: "Jay's", label: "Jay's — The Cathedral, Fort Lauderdale", left: "6%", width: "23%", bottom: "6%", height: "58%" },
  { slug: "naked-taco", name: "Naked Taco", label: "Naked Taco — The Riot, 1111 Collins Avenue, Miami Beach", left: "33%", width: "19%", bottom: "6%", height: "34%" },
  { slug: "highbar", name: "HighBar", label: "HighBar — The View, the rooftop above Naked Taco", left: "52%", width: "15%", bottom: "40%", height: "26%" },
  { slug: "riviera", name: "Riviera", label: "Riviera — The Coast, Fort Lauderdale Beach", left: "64%", width: "28%", bottom: "6%", height: "44%" },
] as const;

export function Hero() {
  const panoRef = useRef<HTMLDivElement>(null);

  // Gentle parallax: the panorama drifts up a touch slower than the page.
  useEffect(() => {
    const el = panoRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      // Positive shift lags the panorama behind the scroll (parallax). The image
      // is scaled from its bottom edge, so the headroom sits on top — shifting
      // down stays within it and never exposes the bottom edge.
      const shift = Math.min(y * 0.08, 34);
      el.style.setProperty("--pano-shift", `${shift}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-forest-deep">
      {/* --------------------------- panorama (bottom layer) --------------------------- */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div
          ref={panoRef}
          className="hero-pano relative w-full overflow-hidden"
          style={{ height: "clamp(340px, 62vh, 660px)" }}
        >
          <picture>
            <source media="(max-width: 640px)" srcSet="/brand/engraving-panorama-mobile.webp" />
            <img
              src="/brand/engraving-panorama-1600.webp"
              alt=""
              aria-hidden="true"
              width={1600}
              height={681}
              decoding="async"
              className="hero-pano__img absolute inset-0 h-full w-full object-cover object-bottom"
            />
          </picture>

          {/* The engraving background is recoloured to the exact page green
              (#0F2417), so it lines up seamlessly — no top fade needed. Only a
              whisper at the outer left/right edges to soften where the buildings
              meet the viewport edge. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(to right, #0f2417 0%, rgba(15,36,23,0) 6%, rgba(15,36,23,0) 94%, #0f2417 100%)" }}
          />

          {/* atmospheric drift — moon glow, window embers, drifting sparks */}
          <Atmosphere />

          {/* clickable venue hotspots */}
          <nav aria-label="Our four rooms" className="absolute inset-0">
            {VENUES.map((v) => (
              <Link
                key={v.slug}
                href={`/collection/${v.slug}`}
                aria-label={v.label}
                className="hero-venue group absolute"
                style={{ left: v.left, width: v.width, bottom: v.bottom, height: v.height }}
              >
                <span className="hero-venue__name" aria-hidden="true">
                  {v.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* -------- content overlay: mark → tagline → rule → statement --------
          pointer-events-none so the venue hotspots on the panorama beneath
          stay clickable; nothing in this layer is interactive. */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pb-[44vh] pt-[var(--header-h)] text-center sm:pb-[52vh]">
        <img
          src="/brand/wordmark.webp"
          alt="Room 7"
          width={705}
          height={292}
          fetchPriority="high"
          decoding="async"
          className="hero-rise hero-logo w-[min(60vw,380px)] max-w-full"
          style={{ animationDelay: "80ms", filter: "drop-shadow(0 2px 24px rgba(15,36,23,0.75))" }}
        />

        <p
          className="hero-rise mt-6 text-[0.7rem] uppercase tracking-[0.4em] text-gold sm:text-[0.8rem] sm:tracking-[0.5em]"
          style={{ fontFamily: "var(--font-label)", animationDelay: "260ms" }}
        >
          Elevated Hospitality
        </p>

        <DiamondRule className="hero-rise mt-5" style={{ animationDelay: "420ms" }} />

        {/* Visually-hidden page heading — keeps a single h1 for SEO / screen
            readers now that the on-screen statement is gone. */}
        <h1 className="sr-only">Room 7 — Elevated Hospitality</h1>
      </div>

      {/* --------------------------- scroll cue --------------------------- */}
      <a
        href="#statement"
        aria-label="Scroll to discover"
        className="hero-scroll group absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span
          className="text-[10px] uppercase tracking-[0.3em] text-champagne/60 transition-colors group-hover:text-gold"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Scroll to discover
        </span>
        <svg width="16" height="22" viewBox="0 0 16 22" fill="none" aria-hidden="true" className="hero-chev text-gold">
          <path d="M2 6l6 6 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12l6 6 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
        </svg>
      </a>
    </section>
  );
}

/** Thin gold rule with a centered open diamond. */
function DiamondRule({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} style={style} aria-hidden="true">
      <span className="block h-px w-16 bg-gradient-to-r from-transparent to-gold/70 sm:w-24" />
      <svg width="9" height="9" viewBox="0 0 10 10" className="text-gold" fill="none">
        <path d="M5 0.6L9.4 5 5 9.4 0.6 5 5 0.6Z" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="block h-px w-16 bg-gradient-to-l from-transparent to-gold/70 sm:w-24" />
    </div>
  );
}

/** Faint, slow atmosphere over the engraving. All motion is CSS + reduced-motion gated. */
function Atmosphere() {
  return (
    <div className="hero-atmos pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* moon glow, bottom-right where the moon sits in the art */}
      <span
        className="hero-glow absolute"
        style={{ left: "93%", bottom: "26%", width: "120px", height: "120px", background: "radial-gradient(circle, rgba(216,190,120,0.5), transparent 68%)", animationDelay: "0ms" }}
      />
      {/* warm window embers */}
      <span className="hero-glow absolute" style={{ left: "19%", bottom: "16%", width: "70px", height: "60px", background: "radial-gradient(circle, rgba(216,168,90,0.32), transparent 70%)", animationDelay: "900ms" }} />
      <span className="hero-glow absolute" style={{ left: "42%", bottom: "12%", width: "90px", height: "50px", background: "radial-gradient(circle, rgba(216,168,90,0.28), transparent 72%)", animationDelay: "1700ms" }} />
      <span className="hero-glow absolute" style={{ left: "75%", bottom: "12%", width: "90px", height: "50px", background: "radial-gradient(circle, rgba(216,168,90,0.26), transparent 72%)", animationDelay: "2500ms" }} />
      {/* drifting sparks */}
      <span className="hero-spark absolute" style={{ left: "22%", bottom: "20%", animationDelay: "0ms" }} />
      <span className="hero-spark absolute" style={{ left: "48%", bottom: "16%", animationDelay: "2200ms" }} />
      <span className="hero-spark absolute" style={{ left: "68%", bottom: "24%", animationDelay: "3600ms" }} />
      <span className="hero-spark absolute" style={{ left: "88%", bottom: "30%", animationDelay: "5200ms" }} />
    </div>
  );
}
