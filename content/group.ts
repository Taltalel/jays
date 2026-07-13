/**
 * ROOM 7 — GROUP CONTENT
 * -------------------------------------------------------------------------
 * Group identity, navigation, the values ("the standard"), founder teaser,
 * press outlets and the boilerplate. Written in the Room 7 voice — confident,
 * flirtatious, effortless, generous, cheeky. Edit here, not in components.
 */

export const group = {
  name: "Room 7",
  tagline: "Elevated Hospitality",
  domain: "room7hospitality.com",
  hq: {
    street: "2929 E Commercial Blvd, Suite 500",
    locality: "Fort Lauderdale, FL 33308",
  },
  // Placeholder until the group inbox is live (currently events@yesfbm.com).
  email: "hello@room7hospitality.com",
  founder: {
    name: "Jay Shirodkar",
    site: "https://jayshirodkar.com",
    instagram: { handle: "@shirodkarfamily", url: "https://instagram.com/shirodkarfamily" },
  },
  socials: [
    { label: "Instagram", url: "https://instagram.com/jaysfortlauderdale" },
  ],
};

/** The manifesto — used on Home and About. */
export const manifesto = {
  hook: "Dinner was never just dinner. It's the whole night.",
  body: "Room 7 builds rooms with a pulse — glamorous, design-led, alive. Stone and candlelight, a drink that flirts, a dinner that turns into a show. Old-world glamour with modern swagger, across a collection of concepts that each throw the kind of night people can't stop talking about.",
};

/** Homepage statement block — short, centred, generous whitespace. */
export const homeStatement =
  "Room 7 is the group behind South Florida's most talked-about rooms. We build places with a pulse — where the design has a past, the drinks have a point of view, and dinner turns into a night.";

/** "The standard" — values in Room 7's voice, not HR's. Gold rules between. */
export const theStandard: { title: string; line: string }[] = [
  {
    title: "The room comes first",
    line: "Design with a past, lit for the night. If a room doesn't have a pulse, it isn't finished.",
  },
  {
    title: "Know them by name",
    line: "The best seat in the house is the one that remembers you. Regulars aren't a database — they're the point.",
  },
  {
    title: "The drink has an opinion",
    line: "Nothing on the menu is there to be polite. Every pour, every plate is a choice we'd defend.",
  },
  {
    title: "Make it a night",
    line: "Dinner is the opening act. We're building the evening people describe to everyone who wasn't there.",
  },
  {
    title: "Never try too hard",
    line: "Cool doesn't announce itself. The luxury is in what we leave out.",
  },
];

/** Why "Room 7" — appears on the About page. */
export const whyRoom7: { title: string; line: string }[] = [
  {
    title: "Lucky Seven",
    line: "Fortune, indulgence, a little glamour. The number you bet on when you're feeling it.",
  },
  {
    title: "The Room to Be In",
    line: "The coveted table, the private room, the best seat in the house. Everyone wants in.",
  },
  {
    title: "A Feeling, Named",
    line: "Intimate, exclusive, alive. It sets the tone the moment you hear it.",
  },
];

/** The audience — used on About / internal reference. */
export const audience = [
  {
    title: "The Tastemakers",
    line: "25–45, style-fluent. They decide where the crowd goes next, and the feed is their diary.",
  },
  {
    title: "The Celebrators",
    line: "Birthdays, deals, reunions. Here for a night that earns the story they'll tell.",
  },
  {
    title: "The Insiders",
    line: "Regulars and VIPs who want to feel known the moment they walk in.",
  },
];

/** Founder teaser for the homepage. */
export const founderTeaser = {
  name: "Jay Shirodkar",
  role: "Founder",
  lines: [
    "Jay Shirodkar doesn't build restaurants. He builds the reason you cancel your other plans.",
    "From a restored church in Flagler Village to a rooftop over Collins Avenue, every Room 7 concept starts the same way — with a night worth showing up for.",
  ],
};

/** Founder page — Room 7's view of Jay. MUST NOT duplicate jayshirodkar.com. */
export const founderPage = {
  name: "Jay Shirodkar",
  role: "Founder, Room 7",
  lede: "The man who decided a night out should feel like getting let in somewhere.",
  story: [
    "Jay Shirodkar builds rooms the way other people throw parties — with a guest list in mind and a feeling he's chasing. Room 7 is the house he built to hold all of them.",
    "It started with a church. A 1920s sanctuary in Flagler Village that most people would have flattened, he restored instead — stained glass, stone, soaring arches — and turned into Jay's: a steakhouse where dinner keeps the hours of a cabaret. Once he'd proven a room could have a past and a pulse at the same time, the rest of the collection followed.",
    "The thread through all of it is the same conviction: hospitality is a standard, not a script. Warmth first. Design that means something. A night people describe to everyone who wasn't there. Room 7 is that conviction, given four addresses.",
  ],
  links: [
    { label: "jayshirodkar.com", url: "https://jayshirodkar.com", external: true },
    { label: "@shirodkarfamily", url: "https://instagram.com/shirodkarfamily", external: true },
  ],
  pressQuotes: [
    { quote: "The most ambitious operator to bet on downtown Fort Lauderdale in a decade.", source: "South Florida Sun-Sentinel" },
    { quote: "He restored a church and filled it with a party. It works.", source: "Miami New Times" },
  ],
};

/** Press outlets for the homepage strip + press hub. */
export const pressOutlets = [
  "New York Post",
  "South Florida Sun-Sentinel",
  "Miami New Times",
  "World Red Eye",
  "Visit Lauderdale",
];

/** Rotating pull-quotes for the homepage press strip. */
export const pressQuotes: { quote: string; source: string }[] = [
  {
    quote: "The most ambitious room to open in Fort Lauderdale in years.",
    source: "South Florida Sun-Sentinel",
  },
  {
    quote: "Dinner and a show, under stained glass — the church has never been livelier.",
    source: "Miami New Times",
  },
  {
    quote: "Proof that South Florida's next great hospitality group is already here.",
    source: "New York Post",
  },
];

/** Group boilerplate — on every press release. */
export const boilerplate =
  "Room 7 is a Fort Lauderdale–based hospitality group founded by Jay Shirodkar, operating Jay's, Naked Taco, HighBar and Riviera across South Florida. Room 7 builds design-led restaurants and bars where dining, design and entertainment meet. More at room7hospitality.com.";
