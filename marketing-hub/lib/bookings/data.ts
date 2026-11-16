import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildReport, type ChannelInput, type LinkRef } from "@/lib/bookings/core";
import { ATTRIBUTION_CHANNELS, OPENTABLE_RESERVE_URL, SPEND_CHANNEL } from "@/lib/links/core";
import { getTransactions, spendByChannel } from "@/lib/spend/queries";
import { addMonths, nyStartOfDay } from "@/lib/time";

export interface TrackedLink {
  id: string;
  code: string;
  label: string;
  channel: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string | null;
  utm_content: string | null;
  destination: string;
  placement: string | null;
  active: boolean;
  created_at: string;
}

export async function getLinks(db: SupabaseClient): Promise<TrackedLink[]> {
  const { data, error } = await db.from("tracked_links").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as TrackedLink[];
}

export async function getLinkRefs(db: SupabaseClient): Promise<LinkRef[]> {
  const { data } = await db.from("tracked_links").select("id, code, channel");
  return (data ?? []) as LinkRef[];
}

/** Human (non-bot) clicks per link between two NY dates (to is exclusive). */
export async function clicksByLink(db: SupabaseClient, from: string, to: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const pageSize = 1000;
  for (let page = 0; page < 200; page++) {
    const { data, error } = await db
      .from("link_clicks")
      .select("link_id")
      .eq("is_bot", false)
      .gte("clicked_at", nyStartOfDay(from).toISOString())
      .lt("clicked_at", nyStartOfDay(to).toISOString())
      .range(page * pageSize, page * pageSize + pageSize - 1);
    if (error) throw new Error(error.message);
    for (const r of data ?? []) counts.set(r.link_id, (counts.get(r.link_id) ?? 0) + 1);
    if (!data || data.length < pageSize) break;
  }
  return counts;
}

export interface BookingRecord {
  id: string;
  platform: "opentable" | "eventbrite" | "manual";
  booked_on: string;
  kind: string;
  quantity: number;
  covers: number | null;
  revenue_cents: number | null;
  status: string;
  link_id: string | null;
  channel: string | null;
  source_label: string | null;
  how: string;
  note: string | null;
}

export async function getBookings(db: SupabaseClient, from: string, to: string): Promise<BookingRecord[]> {
  const { data, error } = await db
    .from("bookings")
    .select("*")
    .gte("booked_on", from)
    .lt("booked_on", to)
    .order("booked_on", { ascending: false })
    .limit(20000);
  if (error) throw new Error(error.message);
  return (data ?? []) as BookingRecord[];
}

const isOpenTable = (url: string) => /(^|\.)opentable\.com$/.test(safeHost(url)) || url === OPENTABLE_RESERVE_URL;
function safeHost(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/** Everything the Bookings page shows for one month. */
export async function bookingReport(db: SupabaseClient, month: string) {
  const from = `${month}-01`;
  const to = addMonths(from, 1);
  const [links, clicks, bookings, txns] = await Promise.all([
    getLinks(db),
    clicksByLink(db, from, to),
    getBookings(db, from, to),
    getTransactions(db, { month }),
  ]);

  const spend = spendByChannel(txns);
  const linkById = new Map(links.map((l) => [l.id, l]));
  const channels = new Map<string, ChannelInput>();
  const ch = (name: string) => {
    if (!channels.has(name)) {
      const spendChannel = SPEND_CHANNEL[name];
      channels.set(name, {
        channel: name,
        humanClicks: 0,
        clicksToOpenTable: 0,
        confirmedBookings: 0,
        tickets: 0,
        covers: 0,
        revenueCents: 0,
        spendCents: spendChannel ? (spend.get(spendChannel) ?? 0) : 0,
      });
    }
    return channels.get(name)!;
  };
  for (const name of ATTRIBUTION_CHANNELS) ch(name);

  for (const [linkId, n] of clicks) {
    const l = linkById.get(linkId);
    if (!l) continue;
    const c = ch(l.channel);
    c.humanClicks += n;
    if (isOpenTable(l.destination)) c.clicksToOpenTable += n;
  }

  let openTablePool = 0;
  let unattributedOther = 0;
  const live = bookings.filter((b) => b.status === "booked");
  for (const b of live) {
    // OpenTable bookings with no source, or credited to the website widget, are
    // where traffic from our links lands: they go to the shared (estimated) pool.
    if (b.platform === "opentable" && b.how !== "link" && (b.channel === null || b.channel === "Website")) {
      openTablePool += b.quantity;
      continue;
    }
    if (!b.channel) {
      unattributedOther += b.quantity;
      continue;
    }
    const c = ch(b.channel);
    if (b.kind === "ticket") c.tickets += b.quantity;
    else c.confirmedBookings += b.quantity;
    c.covers += b.covers ?? 0;
    c.revenueCents += b.revenue_cents ?? 0;
  }

  const { rows, poolRate } = buildReport([...channels.values()], openTablePool);
  const perLink = links.map((l) => ({
    link: l,
    clicks: clicks.get(l.id) ?? 0,
    bookings: live.filter((b) => b.link_id === l.id).reduce((s, b) => s + b.quantity, 0),
  }));

  return {
    from,
    to,
    rows: rows.filter((r) => r.humanClicks || r.confirmedBookings || r.tickets || r.estimatedBookings || r.spendCents),
    allRows: rows,
    poolRate,
    openTablePool,
    unattributedOther,
    totals: {
      clicks: [...clicks.values()].reduce((a, b) => a + b, 0),
      bookings: live.filter((b) => b.kind !== "ticket").reduce((s, b) => s + b.quantity, 0),
      tickets: live.filter((b) => b.kind === "ticket").reduce((s, b) => s + b.quantity, 0),
      covers: live.reduce((s, b) => s + (b.covers ?? 0), 0),
      cancelled: bookings.filter((b) => b.status !== "booked").length,
    },
    perLink,
    hasBookings: bookings.length > 0,
  };
}
