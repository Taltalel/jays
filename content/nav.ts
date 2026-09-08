/**
 * ROOM 7, NAVIGATION
 * Desktop: THE COLLECTION ▾ · ABOUT ▾ · PRIVATE EVENTS · PRESS · CAREERS ·
 * CONTACT  + a gold-outlined RESERVE ▾ pinned right.
 */

import { venues } from "./venues";

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; sublabel?: string; href: string }[];
};

export const primaryNav: NavItem[] = [
  {
    label: "The Collection",
    href: "/collection",
    children: [
      { label: "Jay's", sublabel: "Fort Lauderdale", href: "/collection/jays" },
      { label: "Naked Taco", sublabel: "Collins Avenue", href: "/collection/naked-taco" },
      { label: "HIGHBAR", sublabel: "The rooftop", href: "/collection/highbar" },
    ],
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "The Group", href: "/about" },
      { label: "Jay Shirodkar", href: "/about/jay-shirodkar" },
    ],
  },
  { label: "Private Events", href: "/private-events" },
  { label: "Press", href: "/press" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

/** RESERVE ▾, a reservation link per venue. Never make anyone hunt. */
export const reserveLinks = venues
  .filter((v) => v.reservation)
  .map((v) => ({
    slug: v.slug,
    label: v.name,
    sublabel: v.destination,
    href: v.reservation!.url,
    external: true,
  }));
