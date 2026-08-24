/**
 * ROOM 7, PRIVATE EVENTS content.
 *
 * Collins Avenue data (Naked Taco + HighBar) is REAL, sourced from the venue's
 * Catering & Events deck: three event spaces, 50–275 guests across the property,
 * the catering collections and booking terms below. Copy is rewritten in Room
 * 7's voice (facts kept, the deck's prose not reused).
 *
 * Jay's and Riviera capacities are still on request, confirm and fill when
 * their event decks are available.
 */

export const whatWeHost = [
  { title: "Buyouts", line: "The whole room, the whole night, entirely yours." },
  { title: "Private dining", line: "A room within the room, dinner with the door closed." },
  { title: "Brand & press events", line: "Launches that photograph as well as they land." },
  { title: "Corporate", line: "Off-sites that people actually want to attend." },
  { title: "Celebrations", line: "Birthdays, engagements, the deal that finally closed." },
];

/** Per-venue capacity, honest to what we know. */
export const capacities: { venue: string; nickname: string; capacity: string; note: string }[] = [
  {
    venue: "Jay's",
    nickname: "The Cathedral",
    capacity: "On request",
    note: "Buyouts and private dining under the arches, capacity confirmed on request.",
  },
  {
    venue: "Naked Taco",
    nickname: "The Riot",
    capacity: "50–275*",
    note: "Indoor dining and bars, part of the 1111 Collins property (three spaces, up to 275).",
  },
  {
    venue: "HIGHBAR",
    nickname: "The View",
    capacity: "50–275*",
    note: "Rooftop pool, daybeds and cabanas, part of the 1111 Collins property.",
  },
  {
    venue: "Riviera",
    nickname: "The Coast",
    capacity: "On request",
    note: "Oceanfront buyouts and beachside receptions, capacity confirmed on request.",
  },
];

/** The three real event spaces at 1111 Collins (Naked Taco + HighBar). */
export const collinsSpaces = [
  {
    name: "Naked Taco",
    kind: "Indoor dining & bars",
    line: "The electric Mexican dining room, The Patio out front, plus Bar Noche and Bar Mañana. Wrought iron, star lanterns and leather booths for seated dinners and cocktail receptions.",
  },
  {
    name: "HIGHBAR Poolside",
    kind: "Rooftop pool & bar",
    line: "A glowing rooftop pool with daybeds and cabanas, views from Collins Avenue to the Atlantic, the backdrop for pool parties, activations and sunset socials.",
  },
  {
    name: "West Terrace",
    kind: "Open-air lounge",
    line: "An intimate open-air terrace framed by palms, flexible high-tops and lounge seating for receptions, rehearsal dinners and semi-private gatherings.",
  },
];

/** Catering collections (real package structure). */
export const cateringCollections = [
  { name: "Signature Portfolio", line: "Three customizable tiers, breakfast, lunch and dinner, buffet or plated." },
  { name: "Taco & Bowl Buffet", line: "Build-your-own taco and bowl bars in three tiers." },
  { name: "Continental Breakfast", line: "Morning buffets, custom stations and à la carte add-ons." },
  { name: "Premium Boxed Lunches", line: "Individually packed boxes for corporate days and events." },
  { name: "Bar Packages", line: "Three-hour open bar, Silver, Gold and Platinum." },
];

/** How it works, the real booking terms. */
export const eventTerms = [
  "Fully customizable and booked 30+ days in advance.",
  "Pricing is based on a three-hour event.",
  "Minimum 50, maximum 275 guests on the Collins property.",
  "A 25% gratuity applies to food & beverage, plus tax.",
];
