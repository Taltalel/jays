/**
 * ROOM 7 — CAREERS
 * We hire across all four rooms. Rather than list every open role, people
 * choose a room and apply for any position; applications route to the careers
 * inbox. Teams below are the areas we hire for.
 */

import type { Field } from "@/components/ui/InquiryForm";

export type VenueKey = "jays" | "naked-taco" | "highbar" | "riviera" | "group";

export const venueLabels: Record<VenueKey, string> = {
  jays: "Jay's",
  "naked-taco": "Naked Taco",
  highbar: "HighBar",
  riviera: "Riviera",
  group: "The Group",
};

export const venueLocations: Record<VenueKey, string> = {
  jays: "Fort Lauderdale",
  "naked-taco": "Miami Beach",
  highbar: "Miami Beach",
  riviera: "Fort Lauderdale Beach",
  group: "Fort Lauderdale",
};

/** The areas we hire for — shown so applicants know the scope. */
export const teams = ["Front of House", "Kitchen", "Bar", "Management", "Events & Group"];

export const whyRoom7Careers = [
  { title: "Warmth is the skill", line: "We hire for how you make a room feel. The rest we'll teach." },
  { title: "Rooms worth working in", line: "A restored church, a rooftop, the beach. Your office has a view." },
  { title: "Room to move", line: "Four rooms, one house. Grow across the collection, not out of it." },
];

/** The application form — apply per venue for any position. */
export const careersFields: Field[] = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel" },
  {
    name: "venue",
    label: "Which room",
    type: "select",
    required: true,
    options: ["Jay's", "Naked Taco", "HighBar", "Riviera", "The Group", "Open to any"],
  },
  { name: "position", label: "Position of interest (or “any”)", type: "text" },
  { name: "portfolio", label: "Resume / LinkedIn (URL)", type: "text" },
  { name: "message", label: "Tell us about you", type: "textarea", full: true },
];
