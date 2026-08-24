/**
 * ROOM 7, PRESS
 * Releases (each on its own indexable URL) and coverage ("Buzz").
 * All copy is original Room 7 material. Add a release by appending an object
 * to `releases`, the /press/[slug] route renders it with NewsArticle schema.
 */

export type Release = {
  slug: string;
  title: string;
  dek: string;
  date: string; // ISO
  dateline: string; // e.g. "FORT LAUDERDALE, FL"
  body: string[];
};

export const releases: Release[] = [
  {
    slug: "yes-hospitality-becomes-room-7",
    title: "YES Hospitality Group Becomes Room 7",
    dek: "The Fort Lauderdale group behind Jay's, Naked Taco, HIGHBAR and Riviera rebrands under a single house with one standard: elevated hospitality.",
    date: "2026-07-13",
    dateline: "FORT LAUDERDALE, FL",
    body: [
      "The hospitality group founded by Jay Shirodkar has a new name. What operated as YES Hospitality Group is now Room 7, one house for four rooms across South Florida.",
      "The change is a matter of clarity, not direction. Jay's, Naked Taco, HIGHBAR and Riviera each keep their own name, team and character. Room 7 is the standard they share: design-led rooms, a point of view behind every menu, and a night that starts at dinner and doesn't stop there.",
      "“We were never four separate restaurants that happened to share an owner,” said Shirodkar. “We were always one idea told four ways. Room 7 finally says that out loud.”",
      "The group's flagship, Jay's, occupies a restored 1920s church in Flagler Village. Naked Taco and its rooftop, HIGHBAR, sit together at 1111 Collins Avenue in Miami Beach. Riviera holds the beach at Hotel Maren on Fort Lauderdale Beach.",
    ],
  },
  {
    slug: "room-7-launches-online",
    title: "Room 7 Launches at room7hospitality.com",
    dek: "The group's new home online brings all four rooms under one roof, with press, careers and private events in one place.",
    date: "2026-07-13",
    dateline: "FORT LAUDERDALE, FL",
    body: [
      "Room 7 today launched its group website at room7hospitality.com, a single destination for the collection, the story behind the house, and everything from reservations to private-event inquiries.",
      "The site leads with the group's most distinctive asset: Jay's, the restored church that set the tone for everything that followed. Each venue keeps a full page of its own, with the reservation and the visit one click away.",
      "For press, careers and event bookers, the site consolidates what used to live across four separate domains into one house.",
    ],
  },
];

export const releaseBySlug = (slug: string) => releases.find((r) => r.slug === slug);

/** Coverage ("Buzz"), outlet + headline + pull-quote + outbound link. */
export type Coverage = {
  outlet: string;
  headline: string;
  quote: string;
  url: string;
  date: string;
};

// Real coverage only, populate as articles publish (outlet, headline, quote,
// live url, date). Empty until then so nothing is attributed to a publication
// that hasn't actually covered Room 7.
export const coverage: Coverage[] = [];

/** Press-kit contents, TODO: attach real files. */
export const pressKit = [
  { label: "Logo suite", note: "Wordmark + monogram, gold on forest" },
  { label: "Venue photography", note: "High-res, per venue" },
  { label: "Founder bio", note: "Jay Shirodkar, short + long" },
  { label: "Boilerplate & fact sheet", note: "Group facts, addresses, hours" },
];
