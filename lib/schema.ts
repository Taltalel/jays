/**
 * ROOM 7 — JSON-LD schema builders.
 * Organization on the group site; Restaurant per venue; NewsArticle per
 * press release. Validate with Google's Rich Results Test.
 */

import { group } from "@/content/group";
import type { Venue } from "@/content/venues";
import { venues } from "@/content/venues";

const SITE = "https://room7hospitality.com";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: group.name,
  alternateName: "Room 7 Hospitality",
  url: SITE,
  logo: `${SITE}/brand/logo.png`,
  slogan: group.tagline,
  description:
    "Fort Lauderdale hospitality group operating Jay's, Naked Taco, HighBar and Riviera across South Florida.",
  founder: {
    "@type": "Person",
    name: group.founder.name,
    url: group.founder.site,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Fort Lauderdale",
    addressRegion: "FL",
    addressCountry: "US",
  },
  email: group.email,
  sameAs: Array.from(
    new Set([
      group.founder.site,
      ...venues.flatMap((v) => (v.socials ?? [{ url: v.instagram.url }]).map((s) => s.url)),
      ...venues.map((v) => v.website.url),
    ]),
  ),
  subOrganization: venues
    .filter((v) => v.slug !== "highbar")
    .map((v) => ({
      "@type": "Restaurant",
      name: v.name,
      url: `${SITE}/collection/${v.slug}`,
    })),
};

export function restaurantSchema(v: Venue) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: v.name,
    url: `${SITE}/collection/${v.slug}`,
    description: v.descriptor,
    servesCuisine: v.cuisine.split(", "),
    priceRange: v.priceRange,
    acceptsReservations: v.reservation ? "True" : "False",
    ...(v.menuUrl ? { menu: v.menuUrl } : {}),
    ...(v.phone ? { telephone: v.phone } : {}),
    image: `${SITE}/og/${v.slug}.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: v.address.street,
      addressLocality: v.address.locality.split(", ")[0],
      addressRegion: "FL",
      addressCountry: "US",
    },
    ...(v.geo
      ? { geo: { "@type": "GeoCoordinates", latitude: v.geo.lat, longitude: v.geo.lng } }
      : {}),
    parentOrganization: { "@type": "Organization", name: group.name, url: SITE },
  };
}

export function newsArticleSchema(release: {
  slug: string;
  title: string;
  date: string;
  dek: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: release.title,
    description: release.dek,
    datePublished: release.date,
    url: `${SITE}/press/${release.slug}`,
    publisher: {
      "@type": "Organization",
      name: group.name,
      logo: { "@type": "ImageObject", url: `${SITE}/brand/logo.png` },
    },
    author: { "@type": "Organization", name: group.name },
  };
}
