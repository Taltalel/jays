import type { MetadataRoute } from "next";
import { venues } from "@/content/venues";

export const dynamic = "force-static";

const SITE = "https://room7hospitality.com";

/**
 * Sitemap. Currently the homepage is live; as each route ships (collection,
 * about, press, careers, private-events, contact) add it here so it is indexed
 * the day it lands. Venue routes are pre-wired to the data file below.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-07-13");

  const live: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];

  // Venue pages — uncomment as they ship.
  const venuePages: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${SITE}/collection/${v.slug}/`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Only the homepage is returned until the venue pages exist, to avoid
  // listing URLs that 404. Concatenate `venuePages` once they are built.
  void venuePages;
  return live;
}
