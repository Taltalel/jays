import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { careersFields, venueLabels, venueLocations, teams, type VenueKey } from "@/content/careers";
import { group } from "@/content/group";

const KEYS: VenueKey[] = ["jays", "naked-taco", "highbar", "riviera", "group"];

export function generateStaticParams() {
  return KEYS.map((venue) => ({ venue }));
}

export async function generateMetadata({ params }: { params: Promise<{ venue: string }> }): Promise<Metadata> {
  const { venue } = await params;
  if (!KEYS.includes(venue as VenueKey)) return {};
  const label = venueLabels[venue as VenueKey];
  return {
    title: `Careers — ${label}`,
    description: `Apply to work at ${label} — any position. Join Room 7; we hire for warmth first and teach the rest.`,
    alternates: { canonical: `https://room7hospitality.com/careers/${venue}/` },
  };
}

export default async function VenueCareersPage({ params }: { params: Promise<{ venue: string }> }) {
  const { venue } = await params;
  if (!KEYS.includes(venue as VenueKey)) notFound();
  const key = venue as VenueKey;
  const label = venueLabels[key];

  return (
    <>
      <PageHero
        eyebrow={`Careers · ${label}`}
        title={`Work at ${label}.`}
        sub={`${venueLocations[key]} · apply for any position. We hire for warmth first and teach the rest.`}
        tone="riot"
        placeholder="The team at work, mid-service"
        short
      />

      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <Reveal className="mb-8">
          <p className="text-base text-sage">
            We hire at {label} across {teams.slice(0, -1).join(", ")} and {teams[teams.length - 1].toLowerCase()}. Whatever you do, introduce yourself — we read every application.
          </p>
        </Reveal>
        <Reveal>
          <InquiryForm
            fields={careersFields}
            inbox={group.inboxes.careers}
            subject={`Careers application — ${label} — Room 7`}
            submitLabel="Send application"
            confirm="Thank you — we've got it. If there's a fit, you'll hear from us."
            defaults={{ venue: label }}
            analytics={{ event: "career_application_submit", venueField: "venue" }}
          />
        </Reveal>
      </section>
    </>
  );
}
