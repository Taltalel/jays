/**
 * ROOM 7, VENUE DATA
 * -------------------------------------------------------------------------
 * Single source of truth for the three rooms. Edit copy here; components read
 * from it. Addresses, hours, phones and reservation links are VERIFIED, do
 * not change them without re-checking the live venue sites.
 *
 * NOTE ON HIGHBAR: HighBar is Naked Taco's rooftop, same building, same
 * address on Collins Ave. It is not a separate venue in another location.
 */

export type Reservation = {
  provider: "OpenTable" | "Resy" | "SevenRooms";
  url: string;
};

export type Venue = {
  slug: "jays" | "naked-taco" | "highbar";
  name: string;
  nickname: string; // "The Cathedral"
  destination: string; // human location label used on the group site
  flagship?: boolean;
  /** Room 7's line for the venue, the GROUP's view, written fresh here. */
  descriptor: string;
  /** Longer group-voice intro used on the collection + venue hero. */
  lede: string;
  address: {
    street: string;
    locality: string; // e.g. "Fort Lauderdale, FL 33301"
    context?: string; // e.g. "inside Dream South Beach by Hyatt"
  };
  geo?: { lat: number; lng: number };
  phone?: string;
  email?: string;
  website: { label: string; url: string };
  /** Online menu on the venue's own site, we route diners there. */
  menuUrl?: string;
  instagram: { handle: string; url: string };
  /** Full social set (verified from the live venue sites). */
  socials?: { label: string; url: string }[];
  /** Delivery partners, where offered. */
  delivery?: { label: string; url: string }[];
  reservation?: Reservation;
  hours: { label: string; value: string }[];
  cuisine: string;
  priceRange: string; // schema-friendly
  /** The Room / The Table / The Night, group-voice, unique to this site. */
  scenes: {
    room: string;
    table: string;
    night: string;
  };
  /** Two or three short group-voice paragraphs for the venue page story. */
  story: string[];
  /** Rooftop relationship for the Collins Ave building. */
  pairedWith?: "naked-taco" | "highbar";
  /** Real hero photograph (from the Room 7 brand book). */
  heroImage?: string;
  /** CSS object-position for the hero crop focal point. */
  heroPosition?: string;
  /** Extra approved photos for the gallery. */
  photos?: string[];
  /** Real images for the The Room / The Table / The Night scenes. */
  sceneImages?: { room?: string; table?: string; night?: string };
};

export const venues: Venue[] = [
  {
    slug: "jays",
    name: "Jay's",
    nickname: "The Cathedral",
    destination: "Fort Lauderdale",
    flagship: true,
    descriptor: "A steakhouse with a congregation, inside a 1920s church.",
    lede: "Stone, stained glass and candlelight, where dinner keeps the hours of a cabaret.",
    address: {
      street: "441 NE 3rd Ave",
      locality: "Fort Lauderdale, FL 33301",
      context: "Flagler Village",
    },
    geo: { lat: 26.1289, lng: -80.1401 },
    phone: "(954) 329-0971",
    website: { label: "jaysfortlauderdale.com", url: "https://jaysfortlauderdale.com" },
    instagram: { handle: "@jaysfortlauderdale", url: "https://instagram.com/jaysfortlauderdale" },
    menuUrl: "https://jaysfortlauderdale.com/menus",
    socials: [
      { label: "Instagram", url: "https://instagram.com/jaysfortlauderdale" },
      { label: "TikTok", url: "https://www.tiktok.com/@jaysfortlauderdale" },
      { label: "Facebook", url: "https://www.facebook.com/profile.php?id=61574896371876" },
    ],
    reservation: {
      provider: "OpenTable",
      url: "https://www.opentable.com/restref/client/?restref=1426036",
    },
    hours: [
      { label: "Mon", value: "Closed" },
      { label: "Tue–Thu", value: "4–11PM" },
      { label: "Fri–Sat", value: "4PM–12:30AM" },
      { label: "Sun", value: "4–11PM" },
    ],
    cuisine: "Steakhouse, Raw Bar",
    priceRange: "$$$$",
    scenes: {
      room:
        "They kept the bones, the arches, the stone, the light through coloured glass, and moved in velvet, brass and a bar you'd confess anything to.",
      table:
        "Prime cuts, a raw bar with something to prove, and a cocktail list that keeps its own counsel. Order like you're staying.",
      night:
        "Somewhere past the second course the lights lean down and the room stops being a restaurant. Dinner becomes the opening act.",
    },
    story: [
      "Some rooms you build. This one was already standing, a 1920s church that spent a century learning how to hold a crowd. Room 7 gave it a second life with the ceremony left intact.",
      "It is our flagship because it is our thesis: dinner is never just dinner. Under the arches, over a prime cut and a drink that flirts, an evening turns into the kind of night people describe for weeks.",
      "The Cathedral is Room 7 at full volume, old-world glamour, modern swagger, and a standard of hospitality we hold every other room to.",
    ],
    heroImage: "/venues/jays-hero.webp",
    heroPosition: "50% 35%",
    photos: [
      "/venues/jays-interior.webp",
      "/venues/jays-tomahawk.webp",
      "/venues/jays-lobster.webp",
      "/venues/jays-cocktail.webp",
      "/venues/jays-seafood.webp",
      "/venues/jays-rawbar.webp",
      "/venues/jays-bar.webp",
    ],
    sceneImages: {
      room: "/venues/jays-interior.webp",
      table: "/venues/jays-tomahawk.webp",
      night: "/venues/jays-cocktail.webp",
    },
  },
  {
    slug: "naked-taco",
    name: "Naked Taco",
    nickname: "The Riot",
    destination: "Collins Avenue, Miami Beach",
    descriptor: "Tacos, margaritas and mischief with a twelve-year cult following.",
    lede: "Street level at 1111 Collins, the loud, generous heart of the building.",
    address: {
      street: "1111 Collins Avenue",
      locality: "Miami Beach, FL 33139",
      context: "inside Dream South Beach by Hyatt",
    },
    geo: { lat: 25.783, lng: -80.1301 },
    phone: "(305) 534-8455",
    website: { label: "lovenakedtaco.com", url: "https://lovenakedtaco.com" },
    instagram: { handle: "@lovenakedtaco", url: "https://instagram.com/lovenakedtaco" },
    menuUrl: "https://lovenakedtaco.com/menu",
    socials: [
      { label: "Instagram", url: "https://instagram.com/lovenakedtaco" },
      { label: "Facebook", url: "https://www.facebook.com/lovenakedtaco" },
      { label: "TikTok", url: "https://www.tiktok.com/@lovenakedtaco" },
    ],
    delivery: [
      { label: "Uber Eats", url: "https://www.ubereats.com/store/naked-taco-miami-beach/278O83hhV-qswyyizGWUyQ" },
      { label: "DoorDash", url: "https://www.doordash.com/store/naked-taco-miami-beach-74400/" },
      { label: "Grubhub", url: "https://www.grubhub.com/restaurant/naked-taco-1111-collins-ave-miami-beach/10046552" },
    ],
    reservation: {
      provider: "OpenTable",
      url: "https://www.opentable.com/restref/client/?restref=1524856",
    },
    hours: [
      { label: "Daily", value: "7:30AM–11PM" },
      { label: "Breakfast", value: "Daily 7:30AM–2PM" },
      { label: "Happy Hour", value: "Mon–Fri 3–7PM · all day Tue" },
    ],
    cuisine: "Mexican, Tacos, Breakfast",
    priceRange: "$$",
    pairedWith: "highbar",
    scenes: {
      room:
        "A room that runs hot from breakfast to last call, colour, noise, and a crowd that keeps coming back.",
      table:
        "Tuna nachos with a reputation, birria and lobster tacos, margaritas by the round. Twelve years of regulars will tell you what to order.",
      night:
        "By happy hour it tips from lunch into party, the warm-up act for a rooftop two flights up. The night starts here; it doesn't end here.",
    },
    story: [
      "Twelve years on Collins Avenue is a lifetime in a neighbourhood that reinvents itself every season. Naked Taco earned it, a cult following, a favourite send-off before a big night, breakfast worth the walk.",
      "In the collection it plays the extrovert: fast, generous, unpretentious, packed. It is the room that proves elevated hospitality doesn't have to whisper.",
      "And it comes with an upstairs. Naked Taco holds the street; HIGHBAR holds the sky. One address, two moods, one long night.",
    ],
    heroImage: "/venues/naked-taco-hero.webp",
    heroPosition: "50% 50%",
  },
  {
    slug: "highbar",
    name: "HIGHBAR",
    nickname: "The View",
    destination: "Rooftop at 1111 Collins Avenue",
    descriptor: "The rooftop above Naked Taco, pool, skyline, golden hour.",
    lede: "Two flights up from the tacos: an infinity edge, the Atlantic, and the best light in the city.",
    address: {
      street: "1111 Collins Avenue",
      locality: "Miami Beach, FL 33139",
      context: "the rooftop atop Naked Taco · Dream South Beach by Hyatt",
    },
    geo: { lat: 25.783, lng: -80.1301 },
    phone: "(305) 534-8455",
    website: { label: "lovenakedtaco.com/highbar", url: "https://lovenakedtaco.com/highbar" },
    instagram: { handle: "@highbar305", url: "https://instagram.com/highbar305" },
    menuUrl: "https://lovenakedtaco.com/highbar",
    socials: [{ label: "Instagram", url: "https://instagram.com/highbar305" }],
    reservation: {
      provider: "OpenTable",
      url: "https://www.opentable.com/restref/client/?restref=1524856",
    },
    hours: [
      { label: "Sun–Thu", value: "9AM–9PM" },
      { label: "Fri–Sat", value: "9AM–11PM" },
      { label: "Happy Hour", value: "Mon–Fri 3–7PM" },
    ],
    cuisine: "Rooftop Bar, Cocktails",
    priceRange: "$$$",
    pairedWith: "naked-taco",
    scenes: {
      room:
        "An infinity edge, a pool deck and the open Atlantic, the top floor of the same building that serves you tacos at street level.",
      table:
        "Cocktails built for the hour, cold and unhurried, poured while the sky does the work. Come for the light; stay for the DJ.",
      night:
        "Golden hour is the whole point, and then it isn't, weekend sets carry the deck long after the sun has clocked out.",
    },
    story: [
      "HIGHBAR is not a second address. It is the roof of the first one. Ride two floors up from Naked Taco and the noise drops away to a pool deck, an infinity edge and the entire Atlantic.",
      "In the collection it is the exhale, the part of the night that slows down and looks out. Same building, same team, same standard, a completely different altitude.",
      "Downstairs is the riot. Up here is the view. Room 7 built the staircase between them on purpose.",
    ],
    heroImage: "/venues/highbar-hero.webp",
    heroPosition: "50% 42%",
  },
];

export const venueBySlug = (slug: string): Venue | undefined =>
  venues.find((v) => v.slug === slug);

/** Homepage collection: TWO destinations, three rooms.
 *  Naked Taco + HighBar share one card (one building, two experiences). */
export const collectionCards = [
  {
    key: "jays",
    title: "Jay's",
    kicker: "The Cathedral",
    destination: "Fort Lauderdale",
    descriptor: "A steakhouse with a congregation, inside a 1920s church.",
    href: "/collection/jays",
    image: "/venues/jays-hero.webp",
    slugs: ["jays"] as const,
  },
  {
    key: "collins",
    title: "Naked Taco + HIGHBAR",
    kicker: "The Riot & The View",
    destination: "1111 Collins Avenue",
    descriptor: "Tacos at street level, a pool deck at golden hour, one address, two floors.",
    href: "/collection/naked-taco",
    secondaryHref: "/collection/highbar",
    image: "/venues/highbar-hero.webp",
    slugs: ["naked-taco", "highbar"] as const,
  },
];
