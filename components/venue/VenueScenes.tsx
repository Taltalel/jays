import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import type { Venue } from "@/content/venues";

type Tone = "church" | "riot" | "view" | "coast" | "night" | "beach";

const TONES: Record<Venue["slug"], [Tone, Tone, Tone]> = {
  jays: ["church", "night", "night"],
  "naked-taco": ["riot", "riot", "night"],
  highbar: ["view", "view", "night"],
  riviera: ["coast", "beach", "coast"],
};

const SCENES = [
  { key: "room", label: "The Room", n: "01", note: "design · architecture · atmosphere" },
  { key: "table", label: "The Table", n: "02", note: "food & drink" },
  { key: "night", label: "The Night", n: "03", note: "music · programming · energy" },
] as const;

/**
 * THE DETAIL — Room 7's ownable interaction. The evening unfolds as you
 * descend: The Room → The Table → The Night, each scene alternating and
 * revealing on scroll. (Reveals disable under prefers-reduced-motion.)
 */
export function VenueScenes({ venue }: { venue: Venue }) {
  const tones = TONES[venue.slug];
  return (
    <section className="border-t border-champagne/10 bg-forest/40 py-8 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mb-10 md:mb-16">
          <p className="eyebrow mb-3">The Night Unfolds</p>
          <h2 className="h2-display max-w-2xl text-champagne">Three scenes, one evening.</h2>
        </Reveal>

        <div className="flex flex-col gap-6 md:gap-10">
          {SCENES.map((s, i) => {
            const flip = i % 2 === 1;
            return (
              <Reveal key={s.key} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                <div className={`relative aspect-[4/3] overflow-hidden rounded-sm ${flip ? "md:order-2" : ""}`}>
                  <Placeholder
                    tone={tones[i]}
                    seed={`${venue.slug}-${s.key}`}
                    label={`${venue.name} · ${s.label}`}
                    src={venue.sceneImages?.[s.key]}
                    alt={`${venue.name} — ${s.label}`}
                    showLabel={!venue.sceneImages?.[s.key]}
                    className="absolute inset-0"
                  />
                </div>
                <div className={flip ? "md:order-1" : ""}>
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-2xl text-gold/70">{s.n}</span>
                    <h3 className="font-display text-3xl text-champagne md:text-4xl">{s.label}</h3>
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
                    {s.note}
                  </p>
                  <p className="measure mt-5 text-base text-sage md:text-lg">{venue.scenes[s.key]}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
