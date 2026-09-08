import type { MetadataRoute } from "next";
import { venues } from "@/content/venues";
import { releases } from "@/content/press";

export const dynamic = "force-static";

const SITE = "https://room7hospitality.com";
const now = new Date("2026-07-13");

const CAREER_KEYS = ["jays", "naked-taco", "highbar", "group"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "/", priority: 1, cf: "weekly" as const },
    { path: "/collection", priority: 0.9, cf: "monthly" as const },
    { path: "/about", priority: 0.7, cf: "monthly" as const },
    { path: "/about/jay-shirodkar", priority: 0.7, cf: "monthly" as const },
    { path: "/private-events", priority: 0.8, cf: "monthly" as const },
    { path: "/press", priority: 0.7, cf: "weekly" as const },
    { path: "/careers", priority: 0.7, cf: "weekly" as const },
    { path: "/contact", priority: 0.6, cf: "yearly" as const },
    { path: "/gift-cards", priority: 0.5, cf: "yearly" as const },
    { path: "/privacy", priority: 0.2, cf: "yearly" as const },
    { path: "/terms", priority: 0.2, cf: "yearly" as const },
    { path: "/cookies", priority: 0.2, cf: "yearly" as const },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    // The root path is already "/", so appending another slash would emit
    // "https://room7hospitality.com//" for the most important URL on the site.
    url: `${SITE}${r.path === "/" ? "/" : `${r.path}/`}`,
    lastModified: now,
    changeFrequency: r.cf,
    priority: r.priority,
  }));

  venues.forEach((v) =>
    entries.push({ url: `${SITE}/collection/${v.slug}/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 }),
  );
  CAREER_KEYS.forEach((k) =>
    entries.push({ url: `${SITE}/careers/${k}/`, lastModified: now, changeFrequency: "weekly", priority: 0.5 }),
  );
  releases.forEach((r) =>
    entries.push({ url: `${SITE}/press/${r.slug}/`, lastModified: new Date(r.date), changeFrequency: "yearly", priority: 0.6 }),
  );

  return entries;
}
