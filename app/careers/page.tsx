import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { whyRoom7Careers, teams, venueLabels, venueLocations, careersFields, type VenueKey } from "@/content/careers";
import { group } from "@/content/group";

export const metadata: Metadata = {
  title: "Careers, Join the house",
  description:
    "Apply to work at any Room 7 room, Jay's, Naked Taco or HIGHBAR, for any position. We hire for warmth first and teach the rest.",
  alternates: { canonical: "https://room7hospitality.com/careers/" },
};

const order: VenueKey[] = ["jays", "naked-taco", "highbar", "group"];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Join the house."
        sub="We hire for warmth first and teach the rest. Pick a room, apply for any position, and we'll take it from there."
        tone="riot"
        placeholder="The team, working, real people, mid-service"
        image="/venues/naked-taco-hero.webp"
        imagePosition="50% 45%"
      />

      {/* Why Room 7 */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        {/* Keeps the heading order h1 → h2 → h3 for screen readers; the section
            is intentionally untitled visually. */}
        <h2 className="sr-only">Why Room 7</h2>
        <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {whyRoom7Careers.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 50}>
              <h3 className="font-display text-2xl text-champagne">{w.title}</h3>
              <span className="mt-3 block h-px w-14 bg-gold/50" aria-hidden="true" />
              <p className="mt-3 text-base text-sage">{w.line}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Choose your room */}
      <section className="border-y border-champagne/10 bg-forest/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal className="mb-8">
            <p className="eyebrow mb-3">Where do you want to work?</p>
            <h2 className="h2-display text-champagne">Pick a room.</h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {order.map((k, i) => (
              <Reveal key={k} delay={(i % 3) * 50}>
                <Link
                  href={`/careers/${k}`}
                  className="group flex h-full items-center justify-between rounded-sm border border-champagne/10 bg-forest-deep/60 p-6 transition-colors hover:border-gold/40"
                >
                  <div>
                    <h3 className="font-display text-2xl text-champagne">{venueLabels[k]}</h3>
                    <p className="text-sm text-sage">{venueLocations[k]}</p>
                  </div>
                  <span className="text-[12px] uppercase tracking-[0.15em] text-champagne/80 group-hover:text-gold" style={{ fontFamily: "var(--font-label)" }}>
                    Apply →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-sm text-sage">
            We hire across {teams.slice(0, -1).join(", ")} and {teams[teams.length - 1].toLowerCase()}. No open role listed is no problem, apply for any position and tell us where you shine.
          </p>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="scroll-mt-24 border-t border-champagne/10 bg-forest-deep">
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          <Reveal className="mb-10 text-center">
            <p className="eyebrow mb-3">Apply</p>
            <h2 className="h2-display text-champagne">Apply for any position.</h2>
            <p className="measure mx-auto mt-4 text-base text-sage">
              Tell us which room and what you do, we read every application.
            </p>
          </Reveal>
          <InquiryForm
            fields={careersFields}
            inbox={group.inboxes.careers}
            subject="Careers application, Room 7"
            submitLabel="Send application"
            confirm="Thank you, we've got it. If there's a fit, you'll hear from us."
            analytics={{ event: "career_application_submit", venueField: "venue" }}
          />
        </div>
      </section>
    </>
  );
}
