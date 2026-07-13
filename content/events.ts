/**
 * ROOM 7 — PRIVATE EVENTS content.
 * Capacity numbers are PLACEHOLDERS — confirm per venue and fill in. Keep the
 * copy in Room 7's voice: confident, generous, never corporate.
 */

export const whatWeHost = [
  { title: "Buyouts", line: "The whole room, the whole night, entirely yours." },
  { title: "Private dining", line: "A room within the room — dinner with the door closed." },
  { title: "Brand & press events", line: "Launches that photograph as well as they land." },
  { title: "Corporate", line: "Off-sites that people actually want to attend." },
  { title: "Celebrations", line: "Birthdays, engagements, the deal that finally closed." },
];

/** TODO: confirm real capacities with each venue and replace the placeholders. */
export const capacities: {
  venue: string;
  seated: string;
  standing: string;
  privateRoom: string;
}[] = [
  { venue: "Jay's", seated: "TBC", standing: "TBC", privateRoom: "TBC" },
  { venue: "Naked Taco", seated: "TBC", standing: "TBC", privateRoom: "TBC" },
  { venue: "HighBar", seated: "TBC", standing: "TBC", privateRoom: "TBC" },
  { venue: "Riviera", seated: "TBC", standing: "TBC", privateRoom: "TBC" },
];
