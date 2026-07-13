import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";
import { RolesBrowser } from "@/components/careers/RolesBrowser";
import { venueLabels, type VenueKey } from "@/content/careers";

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
    description: `Open roles at ${label}. Join Room 7 — we hire for warmth first and teach the rest.`,
    alternates: { canonical: `https://room7hospitality.com/careers/${venue}` },
  };
}

export default async function VenueCareersPage({ params }: { params: Promise<{ venue: string }> }) {
  const { venue } = await params;
  if (!KEYS.includes(venue as VenueKey)) notFound();
  const key = venue as VenueKey;

  return (
    <>
      <PageHero
        eyebrow={`Careers · ${venueLabels[key]}`}
        title={`Work at ${venueLabels[key]}.`}
        sub="Roles at this room — and a standing invitation to introduce yourself even if nothing here fits yet."
        tone="riot"
        placeholder="The team at work, mid-service"
        short
      />
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <RolesBrowser initial={key} />
        </Reveal>
        <div className="mt-12">
          <CTA href="/careers#apply" variant="outline">Apply now</CTA>
        </div>
      </section>
    </>
  );
}
