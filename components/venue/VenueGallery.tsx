"use client";

import { useEffect, useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";

type Tone = "church" | "riot" | "view" | "coast" | "night" | "beach";

/**
 * THE ROOM — gallery with a lightbox. Placeholders describe the shots we need
 * (people in the rooms, the night — never empty interiors, never stock).
 */
export function VenueGallery({
  name,
  tone,
  shots,
  realPhotos = [],
}: {
  name: string;
  tone: Tone;
  shots: string[];
  /** Approved photographs, placed into the first tiles; the rest stay TODO. */
  realPhotos?: string[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  const tones: Tone[] = [tone, "night", tone, "night", tone, "night", tone, "night"];

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % shots.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + shots.length) % shots.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, shots.length]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <p className="eyebrow mb-8">The Room</p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {shots.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            className={`group relative overflow-hidden rounded-sm ${i % 5 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}
            aria-label={`Open photo: ${label}`}
          >
            <Placeholder
              tone={tones[i % tones.length]}
              seed={`${name}-g${i}`}
              label={label}
              src={realPhotos[i]}
              alt={realPhotos[i] ? `${name} — ${label}` : undefined}
              showLabel={false}
              className="venue-card__img absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]"
            />
            <span className="absolute inset-0 bg-forest-deep/0 transition-colors group-hover:bg-forest-deep/20" />
          </button>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="text-[10px] uppercase tracking-[0.15em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
          TODO · real {name} photography — the night, people in the room
        </span>
      </p>

      {open !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-forest-deep/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo viewer`}
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 text-3xl text-champagne/80 hover:text-gold"
            aria-label="Close"
            onClick={() => setOpen(null)}
          >
            ×
          </button>
          <div className="relative aspect-[3/2] w-full max-w-4xl overflow-hidden rounded-sm" onClick={(e) => e.stopPropagation()}>
            <Placeholder tone={tones[open % tones.length]} seed={`${name}-g${open}`} label={shots[open]} src={realPhotos[open]} className="absolute inset-0" />
          </div>
        </div>
      )}
    </section>
  );
}
