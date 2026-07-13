import { Reveal } from "@/components/ui/Reveal";
import type { Venue } from "@/content/venues";

/** THE STORY — the group's view of the concept (not the menu). */
export function VenueStory({ venue }: { venue: Venue }) {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <p className="eyebrow mb-6">The Story</p>
      </Reveal>
      <div className="measure flex flex-col gap-6">
        {venue.story.map((p, i) => (
          <Reveal key={i} delay={i * 60}>
            <p className={i === 0 ? "font-display text-2xl leading-snug text-champagne md:text-3xl" : "text-base text-sage md:text-lg"}>
              {p}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
