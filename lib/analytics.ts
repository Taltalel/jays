/**
 * ROOM 7 — analytics helper (GA4).
 *
 * One typed `track(event, params)` entry point used everywhere instead of
 * scattering `gtag` calls through components. GA4 is loaded by
 * components/analytics/Analytics.tsx and only when NEXT_PUBLIC_GA_ID is a real
 * measurement ID (so the placeholder never sends data). Outbound-click events
 * use a `beacon` transport so they survive the page unloading.
 */

export const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_ID ?? "").trim();

/** True only for a real "G-XXXX" id — the literal placeholder stays disabled. */
export const GA_ENABLED = /^G-[A-Z0-9]{6,}$/i.test(GA_MEASUREMENT_ID) && !/X{6,}/i.test(GA_MEASUREMENT_ID);

/** Canonical venue values for GA (note the underscore in naked_taco). */
export type VenueParam = "jays" | "naked_taco" | "highbar" | "riviera" | "group";

export type EventParams = Record<string, string | number | boolean | undefined>;

type Gtag = (...args: unknown[]) => void;
function getGtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof g === "function" ? g : null;
}

/** Fire a GA4 event. No-op until GA is loaded, so calls are always safe. */
export function track(event: string, params?: EventParams): void {
  const gtag = getGtag();
  if (!gtag) return;
  const clean: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) if (v !== undefined) clean[k] = v;
  }
  gtag("event", event, { transport_type: "beacon", ...clean });
}

/**
 * Normalise a slug ("naked-taco") or a human label ("Naked Taco", "All Room 7",
 * "Not sure yet") to a canonical GA venue value. Anything group-level or unknown
 * falls back to "group".
 */
export function venueParam(input: string | undefined): VenueParam {
  const s = (input ?? "").trim().toLowerCase();
  if (s === "jays" || s.startsWith("jay")) return "jays";
  if (s.includes("naked")) return "naked_taco";
  if (s.replace(/\s+/g, "").includes("highbar")) return "highbar";
  if (s.includes("riviera")) return "riviera";
  return "group";
}
