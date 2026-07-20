"use client";

import { useEffect, useState } from "react";
import { CTA } from "@/components/ui/CTA";
import { pressOutlets, pressQuotes } from "@/content/group";

/** "In the press", outlet wordmarks + one rotating pull-quote → /press. */
export function PressStrip() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused || pressQuotes.length === 0) return;
    const t = setInterval(() => setI((n) => (n + 1) % pressQuotes.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  // Nothing to show until there's real coverage, hide the whole strip.
  if (pressQuotes.length === 0 && pressOutlets.length === 0) return null;

  return (
    <section
      className="border-y border-champagne/10 bg-forest-deep"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl px-5 py-16 text-center md:px-8 md:py-24">
        <p className="eyebrow mb-10">In the Press</p>

        {/* rotating quote */}
        <div className="relative mx-auto flex min-h-[140px] max-w-3xl items-center justify-center md:min-h-[160px]">
          {pressQuotes.map((q, idx) => (
            <figure
              key={q.source}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${
                idx === i ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={idx === i ? undefined : true}
            >
              <blockquote className="font-display text-balance text-2xl leading-snug text-champagne md:text-4xl">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-5 text-[11px] uppercase tracking-[0.18em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                {q.source}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* outlet wordmarks, TODO: replace with supplied outlet logo SVGs */}
        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
          {pressOutlets.map((o) => (
            <li
              key={o}
              className="font-display text-lg text-champagne/70 transition-colors hover:text-champagne/80 md:text-xl"
            >
              {o}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <CTA href="/press">Read the coverage</CTA>
        </div>
      </div>
    </section>
  );
}
