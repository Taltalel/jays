import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { venues, venueBySlug, type Venue } from "@/content/venues";
import { restaurantSchema } from "@/lib/schema";
import { VenueHero } from "@/components/venue/VenueHero";
import { VenueStory } from "@/components/venue/VenueStory";
import { VenueGallery } from "@/components/venue/VenueGallery";
import { VenueScenes } from "@/components/venue/VenueScenes";
import { VenueVisit } from "@/components/venue/VenueVisit";
import { NextRooms } from "@/components/venue/NextRooms";
import { RoomMark } from "@/components/venue/RoomMark";

export function generateStaticParams() {
  return venues.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = venueBySlug(slug);
  if (!v) return {};
  const title = `${v.name}, ${v.nickname}`;
  const description = `${v.descriptor} ${v.destination}. A Room 7 venue.`;
  return {
    title,
    description,
    alternates: { canonical: `https://room7hospitality.com/collection/${v.slug}/` },
    openGraph: {
      title: `${v.name} · Room 7`,
      description,
      images: [{ url: `/og/${v.slug}.jpg`, width: 1200, height: 630, alt: v.name }],
    },
  };
}

const GALLERY: Record<Venue["slug"], ["church" | "riot" | "view" | "coast", string[]]> = {
  jays: [
    "church",
    [
      "Stained glass over the bar, candlelit",
      "A prime cut hitting the pass",
      "The room at full tilt, dressed up",
      "Velvet booth, close and warm",
      "The cabaret, lights down, faces up",
      "Bartender mid-pour under the arches",
      "Raw bar on ice",
    ],
  ],
  "naked-taco": [
    "riot",
    [
      "Tuna nachos landing on a packed table",
      "Margaritas by the round",
      "Birria mid-dunk",
      "The room loud and full at happy hour",
      "Breakfast light on Collins Ave",
      "Colour, noise, a crowd that stayed",
    ],
  ],
  highbar: [
    "view",
    [
      "Infinity edge into the Atlantic",
      "Golden-hour cocktail on the deck",
      "Pool at dusk, string lights on",
      "Skyline from the roof",
      "Weekend DJ, deck full",
      "Sunset over the water",
    ],
  ],
};

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) notFound();

  const paired = venue.pairedWith ? venueBySlug(venue.pairedWith) : undefined;
  const [tone, shots] = GALLERY[venue.slug];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema(venue)).replace(/</g, "\\u003c") }}
      />
      <VenueHero venue={venue} paired={paired} />
      <VenueStory venue={venue} />
      <VenueGallery name={venue.name} tone={tone} shots={shots} realPhotos={venue.photos ?? []} engraving={`/venues/engraving-${venue.slug}.webp`} />
      <VenueScenes venue={venue} />
      <VenueVisit venue={venue} />
      <NextRooms current={venue.slug} />
      <RoomMark />
    </>
  );
}
