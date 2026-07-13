/**
 * ROOM 7 — CAREERS
 * Roles are editable placeholders. `venue` matches a venue slug (or "group").
 * Add or remove roles freely; the careers page filters by venue automatically.
 */

export type VenueKey = "jays" | "naked-taco" | "highbar" | "riviera" | "group";

export type Role = {
  title: string;
  venue: VenueKey;
  location: string;
  type: "Full-time" | "Part-time" | "Seasonal";
  team: "Front of House" | "Kitchen" | "Bar" | "Management" | "Group";
};

export const roles: Role[] = [
  { title: "Server", venue: "jays", location: "Fort Lauderdale", type: "Full-time", team: "Front of House" },
  { title: "Sommelier", venue: "jays", location: "Fort Lauderdale", type: "Full-time", team: "Bar" },
  { title: "Line Cook", venue: "jays", location: "Fort Lauderdale", type: "Full-time", team: "Kitchen" },
  { title: "Host", venue: "naked-taco", location: "Miami Beach", type: "Part-time", team: "Front of House" },
  { title: "Bartender", venue: "naked-taco", location: "Miami Beach", type: "Full-time", team: "Bar" },
  { title: "Pool & Deck Server", venue: "highbar", location: "Miami Beach", type: "Seasonal", team: "Front of House" },
  { title: "Bar Lead", venue: "highbar", location: "Miami Beach", type: "Full-time", team: "Bar" },
  { title: "Server", venue: "riviera", location: "Fort Lauderdale Beach", type: "Full-time", team: "Front of House" },
  { title: "Breakfast Cook", venue: "riviera", location: "Fort Lauderdale Beach", type: "Full-time", team: "Kitchen" },
  { title: "Events Manager", venue: "group", location: "Fort Lauderdale", type: "Full-time", team: "Group" },
  { title: "Marketing Coordinator", venue: "group", location: "Fort Lauderdale", type: "Full-time", team: "Group" },
];

export const venueLabels: Record<VenueKey, string> = {
  jays: "Jay's",
  "naked-taco": "Naked Taco",
  highbar: "HighBar",
  riviera: "Riviera",
  group: "The Group",
};

export const whyRoom7Careers = [
  { title: "Warmth is the skill", line: "We hire for how you make a room feel. The rest we'll teach." },
  { title: "Rooms worth working in", line: "A restored church, a rooftop, the beach. Your office has a view." },
  { title: "Room to move", line: "Four venues, one house. Grow across the collection, not out of it." },
];
