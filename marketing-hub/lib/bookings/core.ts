/**
 * Booking attribution. Pure functions: reading export files, matching each
 * booking to a tracked link or channel, and the per-channel report maths.
 */
import ExcelJS from "exceljs";
import { createHash } from "node:crypto";
import { parseMoneyToCents } from "@/lib/money";

// ---------------------------------------------------------------------------
// Reading CSV / XLSX into header + rows
// ---------------------------------------------------------------------------

export type Table = { headers: string[]; rows: string[][] };

/** RFC-4180-ish CSV: quotes, escaped quotes, CRLF, BOM. */
export function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      out.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    out.push(row);
  }
  return out.filter((r) => r.some((v) => v.trim() !== ""));
}

export async function readTable(name: string, bytes: ArrayBuffer): Promise<Table> {
  let grid: string[][];
  if (name.toLowerCase().endsWith(".xlsx")) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(bytes);
    const ws = wb.worksheets[0];
    grid = [];
    ws?.eachRow({ includeEmpty: false }, (row) => {
      const vals: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        const v = cell.value;
        let t = "";
        if (v instanceof Date) t = v.toISOString().slice(0, 10);
        else if (v && typeof v === "object" && "result" in v) t = String((v as { result: unknown }).result ?? "");
        else if (v && typeof v === "object" && "text" in v) t = String((v as { text: unknown }).text ?? "");
        else if (v && typeof v === "object" && "richText" in v) t = (v as { richText: { text: string }[] }).richText.map((r) => r.text).join("");
        else t = v === null || v === undefined ? "" : String(v);
        vals[col - 1] = t;
      });
      grid.push(Array.from(vals, (x) => x ?? ""));
    });
  } else {
    grid = parseCsv(new TextDecoder().decode(bytes));
  }
  // Header = first row within the first 10 with 3+ non-empty cells.
  const h = grid.slice(0, 10).findIndex((r) => r.filter((v) => v.trim()).length >= 3);
  if (h < 0) return { headers: [], rows: [] };
  return { headers: grid[h].map((x) => x.trim()), rows: grid.slice(h + 1) };
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9#]+/g, " ").trim();

export function mapColumns(headers: string[], aliases: Record<string, string[]>): Record<string, number> {
  const out: Record<string, number> = {};
  const used = new Set<number>();
  for (const [field, list] of Object.entries(aliases)) {
    for (const alias of list) {
      const i = headers.findIndex((h, idx) => !used.has(idx) && norm(h) === alias);
      if (i >= 0) {
        out[field] = i;
        used.add(i);
        break;
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Attribution matching
// ---------------------------------------------------------------------------

export interface LinkRef {
  id: string;
  code: string;
  channel: string;
}

const KEYWORDS: [RegExp, string][] = [
  [/linkme|link\.me/, "LinkMe"],
  [/instagram|\big\b|facebook|\bmeta\b/, "Instagram"],
  [/mailchimp|e-?mail|newsletter/, "Email"],
  [/\bsms\b|\btext\b|vip/, "SMS"],
  [/\bqr\b/, "Print & QR"],
  [/reserve with google|google/, "Google Business Profile"],
  [/website|widget|restref|restaurant site|own site|direct/, "Website"],
  [/opentable|open table|\bapp\b|\bot\b/, "OpenTable network"],
  [/phone|call/, "Phone"],
  [/walk.?in|in.?house|host/, "Walk-in"],
  [/influenc|partner|press|media/, "Influencers & Media"],
];

export type How = "link" | "platform_source" | "unattributed";

/**
 * Which tracked link or channel a booking came from.
 * 1. a UTM/aff value or the source text names one of our link codes → that link;
 * 2. the platform's own source text names a channel → that channel;
 * 3. otherwise unattributed.
 */
export function attribute(
  fields: { source?: string | null; utmContent?: string | null; utmCampaign?: string | null; aff?: string | null },
  links: LinkRef[],
): { linkId: string | null; channel: string | null; how: How } {
  const byCode = new Map(links.map((l) => [l.code, l]));
  for (const v of [fields.aff, fields.utmContent]) {
    const l = v ? byCode.get(v.trim().toLowerCase()) : undefined;
    if (l) return { linkId: l.id, channel: l.channel, how: "link" };
  }
  const src = (fields.source ?? "").toLowerCase();
  if (src) {
    // Longest code first so "email-omakase-oct" beats "email".
    for (const l of [...links].sort((a, b) => b.code.length - a.code.length)) {
      if (new RegExp(`(^|[^a-z0-9-])${l.code.replace(/[-]/g, "\\-")}($|[^a-z0-9-])`).test(src)) {
        return { linkId: l.id, channel: l.channel, how: "link" };
      }
    }
    for (const [re, channel] of KEYWORDS) if (re.test(src)) return { linkId: null, channel, how: "platform_source" };
  }
  return { linkId: null, channel: null, how: "unattributed" };
}

// ---------------------------------------------------------------------------
// OpenTable reservation export → booking rows
// ---------------------------------------------------------------------------

const OT_COLS: Record<string, string[]> = {
  booked: ["date booked", "booked on", "booked date", "created", "created date", "date created", "booking date", "made on"],
  visit: ["date", "visit date", "reservation date", "date of visit", "dining date", "reservation time", "date time"],
  covers: ["covers", "party size", "size", "guests", "party", "people", "pax", "seats"],
  status: ["status", "reservation status", "state"],
  source: ["source", "reservation source", "booked via", "referrer", "channel", "origin", "booking source", "partner", "booking channel"],
  experience: ["experience", "experience name", "offer", "ticket type"],
  revenue: ["total", "amount", "prepaid amount", "prepayment", "revenue", "price"],
  ref: ["confirmation number", "confirmation #", "confirmation", "conf #", "reservation id", "reservation #", "id"],
  utm_content: ["utm content", "utm_content"],
  utm_campaign: ["utm campaign", "utm_campaign"],
};

export interface BookingRow {
  platform: "opentable" | "eventbrite";
  booked_on: string;
  kind: "reservation" | "experience" | "ticket";
  quantity: number;
  covers: number | null;
  revenue_cents: number | null;
  status: "booked" | "cancelled" | "no_show";
  link_id: string | null;
  channel: string | null;
  source_label: string | null;
  how: How;
  note: string | null;
  import_key: string;
}

export interface ImportPreview {
  platform: "opentable" | "eventbrite";
  mapped: Record<string, string>;
  rows: BookingRow[];
  skipped: { row: number; reason: string }[];
}

export function toIsoDate(s: string, fallbackYear?: number): string | null {
  const t = s.trim();
  if (!t) return null;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/.exec(t);
  if (m) {
    const y = m[3] ? (m[3].length === 2 ? `20${m[3]}` : m[3]) : fallbackYear ? String(fallbackYear) : null;
    return y ? `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}` : null;
  }
  const d = Date.parse(t);
  if (!Number.isNaN(d)) {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  }
  return null;
}

function statusOf(s: string): BookingRow["status"] {
  const n = s.toLowerCase();
  if (/cancel/.test(n)) return "cancelled";
  if (/no.?show/.test(n)) return "no_show";
  return "booked";
}

const keyOf = (...parts: (string | number | null | undefined)[]) =>
  createHash("sha256").update(parts.map((p) => String(p ?? "")).join("|")).digest("hex").slice(0, 32);

export function parseOpenTable(t: Table, links: LinkRef[]): ImportPreview {
  const c = mapColumns(t.headers, OT_COLS);
  const mapped = Object.fromEntries(Object.entries(c).map(([f, i]) => [f, t.headers[i]]));
  const rows: BookingRow[] = [];
  const skipped: ImportPreview["skipped"] = [];
  const seen = new Map<string, number>();
  const get = (r: string[], f: string) => (c[f] !== undefined ? (r[c[f]] ?? "").trim() : "");

  t.rows.forEach((r, i) => {
    const date = toIsoDate(get(r, "booked")) ?? toIsoDate(get(r, "visit"));
    if (!date) return skipped.push({ row: i + 2, reason: "no date" });
    const coversNum = Number(get(r, "covers").replace(/[^\d]/g, ""));
    const experience = get(r, "experience");
    const source = get(r, "source");
    const a = attribute({ source, utmContent: get(r, "utm_content"), utmCampaign: get(r, "utm_campaign") }, links);
    const ref = get(r, "ref");
    const base = keyOf("ot", ref || `${date}|${get(r, "visit")}|${coversNum}|${source}|${experience}`);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    rows.push({
      platform: "opentable",
      booked_on: date,
      kind: experience ? "experience" : "reservation",
      quantity: 1,
      covers: Number.isFinite(coversNum) && coversNum > 0 ? coversNum : null,
      revenue_cents: get(r, "revenue") ? parseMoneyToCents(get(r, "revenue")) : null,
      status: statusOf(get(r, "status")),
      link_id: a.linkId,
      channel: a.channel,
      source_label: source || null,
      how: a.how,
      note: experience || null,
      import_key: `ot:${base}:${n}`,
    });
  });
  return { platform: "opentable", mapped, rows, skipped };
}

// ---------------------------------------------------------------------------
// Eventbrite "Tracking links" report → one row per link per report month
// ---------------------------------------------------------------------------

const EB_COLS: Record<string, string[]> = {
  link: ["tracking link", "tracking link name", "link name", "link", "affiliate", "affiliate code", "code", "name"],
  tickets: ["tickets sold", "tickets", "quantity", "quantity sold", "attendees", "qty"],
  orders: ["orders", "order count", "orders placed"],
  gross: ["gross sales", "gross", "gross revenue", "revenue", "sales", "net sales"],
  event: ["event", "event name", "event title"],
};

export function parseEventbrite(t: Table, links: LinkRef[], month: string): ImportPreview {
  const c = mapColumns(t.headers, EB_COLS);
  const mapped = Object.fromEntries(Object.entries(c).map(([f, i]) => [f, t.headers[i]]));
  const rows: BookingRow[] = [];
  const skipped: ImportPreview["skipped"] = [];
  const get = (r: string[], f: string) => (c[f] !== undefined ? (r[c[f]] ?? "").trim() : "");

  t.rows.forEach((r, i) => {
    const name = get(r, "link");
    if (!name || /^total/i.test(name)) return skipped.push({ row: i + 2, reason: name ? "total row" : "no link name" });
    const tickets = Number(get(r, "tickets").replace(/[^\d]/g, "") || get(r, "orders").replace(/[^\d]/g, "") || 0);
    // Link names may be the code itself, or a full URL with ?aff=code.
    let aff: string | null = name;
    const m = /[?&]aff=([a-z0-9-]+)/i.exec(name);
    if (m) aff = m[1];
    const a = attribute({ aff, source: name }, links);
    const event = get(r, "event");
    rows.push({
      platform: "eventbrite",
      booked_on: `${month}-01`,
      kind: "ticket",
      quantity: tickets,
      covers: null,
      revenue_cents: get(r, "gross") ? parseMoneyToCents(get(r, "gross")) : null,
      status: "booked",
      link_id: a.linkId,
      channel: a.channel,
      source_label: name,
      how: a.how,
      note: event || null,
      // One row per link per event per month: re-importing a month replaces it.
      import_key: `eb:${month}:${keyOf(name.toLowerCase(), event.toLowerCase())}`,
    });
  });
  return { platform: "eventbrite", mapped, rows, skipped };
}

// ---------------------------------------------------------------------------
// Report maths
// ---------------------------------------------------------------------------

export interface ChannelInput {
  channel: string;
  humanClicks: number;
  clicksToOpenTable: number;
  confirmedBookings: number; // reservations/orders/tallies matched to this channel
  tickets: number;
  covers: number;
  revenueCents: number;
  spendCents: number;
}

export interface ChannelRow extends ChannelInput {
  estimatedBookings: number; // share of the unmatched OpenTable pool, by clicks
  costPerBookingCents: number | null;
}

/**
 * OpenTable usually reports bookings from our links as "website"/widget or no
 * source at all. That pool is shared out across channels in proportion to
 * their clicks to OpenTable — an ESTIMATE, labelled as such in the UI.
 */
export function buildReport(channels: ChannelInput[], openTablePool: number): { rows: ChannelRow[]; poolRate: number | null } {
  const totalOtClicks = channels.reduce((s, c) => s + c.clicksToOpenTable, 0);
  const poolRate = totalOtClicks > 0 ? Math.min(1, openTablePool / totalOtClicks) : null;
  const rows = channels.map((c) => {
    const estimatedBookings = poolRate !== null ? Math.round(c.clicksToOpenTable * poolRate * 10) / 10 : 0;
    const total = c.confirmedBookings + c.tickets + estimatedBookings;
    return {
      ...c,
      estimatedBookings,
      costPerBookingCents: c.spendCents > 0 && total > 0 ? Math.round(c.spendCents / total) : null,
    };
  });
  return { rows, poolRate };
}
