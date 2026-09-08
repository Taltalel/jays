/**
 * ROOM 7 — JSON-LD schema builders.
 * Organization on the group site; Restaurant per venue; NewsArticle per
 * press release. Validate with Google's Rich Results Test.
 */

import { group } from "@/content/group";
import type { Venue } from "@/content/venues";
import { venues } from "@/content/venues";

const SITE = "https://room7hospitality.com";

/** Room 7 is the hospitality arm of Shirodkar Industries. */
const PARENT_ORG_URL = "https://www.shirodkarindustries.com";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: group.name,
  alternateName: "Room 7 Hospitality",
  url: SITE,
  logo: `${SITE}/brand/logo.png`,
  slogan: group.tagline,
  description:
    "Fort Lauderdale hospitality group operating Jay's, Naked Taco and HIGHBAR across South Florida.",
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
      PARENT_ORG_URL,
      ...venues.flatMap((v) => (v.socials ?? [{ url: v.instagram.url }]).map((s) => s.url)),
      ...venues.map((v) => v.website.url),
    ]),
  ),
  parentOrganization: {
    "@type": "Organization",
    name: "Shirodkar Industries",
    url: PARENT_ORG_URL,
  },
  subOrganization: venues
    .filter((v) => v.slug !== "highbar")
    .map((v) => ({
      "@type": "Restaurant",
      name: v.name,
      url: `${SITE}/collection/${v.slug}`,
    })),
};

/* ---- opening hours: parse the human-rendered hours into schema.org specs ----
 * The venue `hours` are display strings (e.g. "Tue–Thu" / "4–11PM"). We convert
 * only the operating-hours rows into OpeningHoursSpecification — promotional
 * "Happy Hour" windows and closed days are skipped, and a row fully contained by
 * another for the same days (e.g. a breakfast subset) is dropped. Values come
 * straight from the rendered data; nothing is invented. */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_INDEX: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function expandDays(token: string): string[] | null {
  const t = token.trim().toLowerCase();
  if (t === "daily" || t === "every day") return [...DAY_NAMES];
  const range = t.match(/^([a-z]{3})[a-z]*\s*[–—-]\s*([a-z]{3})[a-z]*$/);
  if (range) {
    const a = DAY_INDEX[range[1]];
    const b = DAY_INDEX[range[2]];
    if (a === undefined || b === undefined) return null;
    const out: string[] = [];
    for (let i = a; ; i = (i + 1) % 7) {
      out.push(DAY_NAMES[i]);
      if (i === b) break;
    }
    return out;
  }
  const single = t.match(/^([a-z]{3})[a-z]*$/);
  if (single && DAY_INDEX[single[1]] !== undefined) return [DAY_NAMES[DAY_INDEX[single[1]]]];
  return null;
}

function to24(hour: number, minute: number, meridiem: string): string {
  let h = hour;
  if (meridiem === "pm" && h !== 12) h += 12;
  if (meridiem === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseTimeRange(value: string): { opens: string; closes: string } | null {
  const m = value.match(
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[–—-]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
  );
  if (!m) return null;
  // A missing meridiem on one end inherits the other's ("4–11PM" → 4PM–11PM).
  const startMer = (m[3] || m[6] || "").toLowerCase();
  const endMer = (m[6] || m[3] || "").toLowerCase();
  return {
    opens: to24(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0, startMer),
    closes: to24(parseInt(m[4], 10), m[5] ? parseInt(m[5], 10) : 0, endMer),
  };
}

function openingHours(hours: { label: string; value: string }[]) {
  const specs: { days: string[]; opens: string; closes: string }[] = [];
  for (const { label, value } of hours) {
    if (/happy/i.test(`${label} ${value}`)) continue; // promotional window, not opening hours
    if (/closed/i.test(value)) continue;
    let days = expandDays(label);
    if (!days) {
      const lead = value.match(/^\s*(daily|[a-z]{3}[a-z]*(?:\s*[–—-]\s*[a-z]{3}[a-z]*)?)/i);
      if (lead) days = expandDays(lead[1]);
    }
    if (!days) continue;
    const t = parseTimeRange(value);
    if (!t) continue;
    specs.push({ days, opens: t.opens, closes: t.closes });
  }
  const key = (d: string[]) => [...d].sort().join(",");
  const kept = specs.filter(
    (s, i) =>
      !specs.some(
        (o, j) =>
          j !== i &&
          key(o.days) === key(s.days) &&
          o.opens <= s.opens &&
          o.closes >= s.closes &&
          (o.opens < s.opens || o.closes > s.closes || j < i),
      ),
  );
  return kept.map((s) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: s.days,
    opens: s.opens,
    closes: s.closes,
  }));
}

export function restaurantSchema(v: Venue) {
  const sameAs = Array.from(new Set([...(v.socials ?? []).map((s) => s.url), v.instagram.url]));
  const hours = openingHours(v.hours);
  return {
    "@context": "https://schema.org",
    // HighBar is a rooftop bar, not a restaurant.
    "@type": v.slug === "highbar" ? "BarOrPub" : "Restaurant",
    name: v.name,
    url: `${SITE}/collection/${v.slug}`,
    description: v.descriptor,
    servesCuisine: v.cuisine.split(", "),
    priceRange: v.priceRange,
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
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    acceptsReservations: v.reservation ? "True" : "False",
    ...(v.reservation
      ? {
          potentialAction: {
            "@type": "ReserveAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: v.reservation.url,
              actionPlatform: [
                "https://schema.org/DesktopWebPlatform",
                "https://schema.org/MobileWebPlatform",
              ],
            },
            result: { "@type": "FoodEstablishmentReservation", name: `Reservation at ${v.name}` },
          },
        }
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
