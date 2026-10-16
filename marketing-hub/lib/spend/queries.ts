import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  effectiveChannel,
  type Budget,
  type Payable,
  type SyncRun,
  type TransactionWithVendor,
  type Vendor,
} from "@/lib/db/types";
import { addMonths } from "@/lib/time";

export interface LogFilters {
  month?: string; // YYYY-MM
  vendor?: string; // vendor id
  channel?: string;
  brand?: string;
  status?: string;
  source?: string;
}

const TXN_SELECT = "*, vendors(id, name, channel, brand)";

/** Statuses that count as money spent. Refunds are stored negative. */
export const SPEND_STATUSES = ["paid", "refund"];

export async function getTransactions(db: SupabaseClient, f: LogFilters = {}, opts: { includeReview?: boolean } = {}) {
  let q = db.from("transactions").select(TXN_SELECT).order("date", { ascending: false }).limit(1000);
  if (!opts.includeReview) q = q.eq("needs_review", false);
  if (f.month && /^\d{4}-\d{2}$/.test(f.month)) {
    const start = `${f.month}-01`;
    q = q.gte("date", start).lt("date", addMonths(start, 1));
  }
  if (f.vendor) q = q.eq("vendor_id", f.vendor);
  if (f.status) q = q.eq("status", f.status);
  if (f.source) q = q.eq("source", f.source);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  let rows = (data ?? []) as TransactionWithVendor[];
  // Channel and brand can come from the transaction or its vendor, so filter after the join.
  if (f.channel) rows = rows.filter((t) => effectiveChannel(t) === f.channel);
  if (f.brand) rows = rows.filter((t) => (t.brand ?? t.vendors?.brand) === f.brand);
  return rows;
}

export async function getReviewQueue(db: SupabaseClient) {
  const { data, error } = await db
    .from("transactions")
    .select(TXN_SELECT)
    .eq("needs_review", true)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as TransactionWithVendor[];
}

export async function getVendors(db: SupabaseClient) {
  const { data, error } = await db.from("vendors").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Vendor[];
}

export async function getPayables(db: SupabaseClient) {
  const { data, error } = await db
    .from("payables")
    .select("*, vendors(id, name)")
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Payable[];
}

export async function getBudgets(db: SupabaseClient, month: string) {
  const { data, error } = await db.from("budgets").select("*").eq("month", month);
  if (error) throw new Error(error.message);
  return (data ?? []) as Budget[];
}

/** Paid spend per vendor per month (YYYY-MM-01) for a date range. */
export async function paidByVendorMonth(db: SupabaseClient, from: string, to: string) {
  const { data, error } = await db
    .from("transactions")
    .select("vendor_id, date, amount_cents")
    .eq("needs_review", false)
    .in("status", SPEND_STATUSES)
    .gte("date", from)
    .lt("date", to);
  if (error) throw new Error(error.message);
  const map = new Map<string, Map<string, number>>();
  for (const r of data ?? []) {
    if (!r.vendor_id) continue;
    const m = `${r.date.slice(0, 7)}-01`;
    const inner = map.get(r.vendor_id) ?? new Map<string, number>();
    inner.set(m, (inner.get(m) ?? 0) + Number(r.amount_cents));
    map.set(r.vendor_id, inner);
  }
  return map;
}

export async function lastSync(db: SupabaseClient, source: string): Promise<SyncRun | null> {
  const { data } = await db
    .from("sync_runs")
    .select("*")
    .eq("source", source)
    .not("finished_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(1);
  return (data?.[0] as SyncRun | undefined) ?? null;
}

export function sumSpend(rows: TransactionWithVendor[]): number {
  return rows.filter((t) => SPEND_STATUSES.includes(t.status)).reduce((s, t) => s + Number(t.amount_cents), 0);
}

export function spendByChannel(rows: TransactionWithVendor[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of rows) {
    if (!SPEND_STATUSES.includes(t.status)) continue;
    const c = effectiveChannel(t);
    m.set(c, (m.get(c) ?? 0) + Number(t.amount_cents));
  }
  return m;
}
