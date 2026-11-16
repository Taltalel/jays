/**
 * Tracked links: channel presets, destination URL building and bot filtering.
 * Pure functions (no server-only imports) so they are unit-testable.
 */

/** Attribution channels, i.e. where a guest came from. */
export const ATTRIBUTION_CHANNELS = [
  "Email",
  "SMS",
  "Instagram",
  "LinkMe",
  "Website",
  "Google Business Profile",
  "Influencers & Media",
  "Print & QR",
  "Paid ads",
  "OpenTable network",
  "Phone",
  "Walk-in",
  "Other",
] as const;
export type AttributionChannel = (typeof ATTRIBUTION_CHANNELS)[number];

/** Spend-log channel each attribution channel's cost is read from. */
export const SPEND_CHANNEL: Partial<Record<string, string>> = {
  Email: "Email",
  Instagram: "Meta/Instagram",
  Website: "Website/GA4",
  "Google Business Profile": "Google Business Profile",
  "Influencers & Media": "Influencers & Media",
  "Print & QR": "Print",
  "Paid ads": "Google Ads",
  "OpenTable network": "Reservations",
};

/** Builder presets: pick a channel, get sensible UTM source/medium. */
export const CHANNEL_PRESETS: Record<string, { source: string; medium: string; codePrefix: string }> = {
  Email: { source: "mailchimp", medium: "email", codePrefix: "email" },
  SMS: { source: "sms", medium: "sms", codePrefix: "sms" },
  Instagram: { source: "instagram", medium: "social", codePrefix: "ig" },
  LinkMe: { source: "linkme", medium: "social", codePrefix: "linkme" },
  Website: { source: "website", medium: "referral", codePrefix: "site" },
  "Google Business Profile": { source: "google", medium: "organic", codePrefix: "gbp" },
  "Influencers & Media": { source: "influencer", medium: "referral", codePrefix: "partner" },
  "Print & QR": { source: "qr", medium: "print", codePrefix: "qr" },
  "Paid ads": { source: "meta", medium: "paid", codePrefix: "ad" },
  Other: { source: "other", medium: "referral", codePrefix: "link" },
};

export const OPENTABLE_RESERVE_URL = "https://www.opentable.com/restref/client/?restref=1426036";
export const WEBSITE_URL = "https://jaysfortlauderdale.com/";

export const DESTINATION_PRESETS = [
  { key: "opentable", label: "OpenTable — reserve a table", url: OPENTABLE_RESERVE_URL },
  { key: "website", label: "Website — home page", url: WEBSITE_URL },
  { key: "custom", label: "Other URL (Eventbrite event, experience, page…)", url: "" },
] as const;

export interface LinkForUrl {
  code: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string | null;
  utm_content: string | null;
  destination: string;
}

/**
 * The URL the guest is sent to: the destination plus UTM tags (kept if the
 * destination already has them). Eventbrite links also get `aff=<code>`, which
 * is what Eventbrite's tracking-links report groups ticket sales by.
 */
export function buildDestination(link: LinkForUrl): string {
  const url = new URL(link.destination);
  const set = (k: string, v: string | null) => {
    if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
  };
  set("utm_source", link.utm_source);
  set("utm_medium", link.utm_medium);
  set("utm_campaign", link.utm_campaign);
  set("utm_content", link.utm_content ?? link.code);
  if (/(^|\.)eventbrite\.[a-z.]+$/.test(url.hostname)) set("aff", link.code);
  return url.toString();
}

/** The public short URL for a code. */
export function shortUrl(base: string, code: string): string {
  const b = base.replace(/\/$/, "");
  // A dedicated short domain (go.example.com) serves codes at the root.
  return /\/\/go\./.test(b) ? `${b}/${code}` : `${b}/go/${code}`;
}

/** "Omakase Oct 22" + "email" → "email-omakase-oct-22" */
export function suggestCode(prefix: string, text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return [prefix, slug].filter(Boolean).join("-").replace(/-+/g, "-").slice(0, 48).replace(/-+$/g, "");
}

export function isValidCode(code: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,47}$/.test(code);
}

/**
 * Link-preview fetchers and crawlers. Posting a link in Instagram, iMessage,
 * WhatsApp or Slack makes the app fetch it once to draw the preview; those are
 * logged as bots and left out of every count.
 */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|facebookcatalog|meta-externalagent|embedly|whatsapp|telegram|discord|skype|linkedin|pinterest|vkshare|quora link|bitlybot|iframely|google-read-aloud|headless|lighthouse|curl|wget|python-requests|go-http-client|node-fetch|axios|okhttp/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}

export function deviceClass(userAgent: string | null | undefined): "mobile" | "tablet" | "desktop" | "unknown" {
  if (!userAgent) return "unknown";
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|android/i.test(userAgent)) return "mobile";
  if (/windows|macintosh|linux|cros/i.test(userAgent)) return "desktop";
  return "unknown";
}

export function referrerHost(referer: string | null | undefined): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).hostname.slice(0, 120);
  } catch {
    return null;
  }
}
