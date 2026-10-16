import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Payable, TransactionWithVendor, Vendor } from "@/lib/db/types";
import { formatCents } from "@/lib/money";
import { addDays, daysBetween, formatDate, nyDate } from "@/lib/time";

export type AlertSeverity = "urgent" | "warning" | "info";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  source: string;
  href?: string;
  external?: boolean;
}

/**
 * Phase 1 alerts: failed/declined payments, overdue payables, vendors marked
 * Failing/Suspended, duplicate subscriptions, and the Needs-review queue.
 * Later phases add ad-cost, ticket-pace, GA4 and review alerts here.
 */
export async function getAlerts(db: SupabaseClient): Promise<Alert[]> {
  const today = nyDate();
  const since = addDays(today, -45);
  const alerts: Alert[] = [];

  const [{ data: txns }, { data: payables }, { data: vendors }, { count: reviewCount }] = await Promise.all([
    db
      .from("transactions")
      .select("*, vendors(id, name, channel, brand)")
      .gte("date", since)
      .in("status", ["failed", "paid"])
      .order("date", { ascending: false }),
    db.from("payables").select("*, vendors(id, name)").eq("status", "open"),
    db.from("vendors").select("*"),
    db.from("transactions").select("id", { count: "exact", head: true }).eq("needs_review", true),
  ]);

  // Failed payments not followed by a later successful payment to the same vendor.
  const rows = (txns ?? []) as TransactionWithVendor[];
  for (const t of rows.filter((r) => r.status === "failed" && !r.needs_review)) {
    const recovered = rows.some(
      (r) => r.status === "paid" && !r.needs_review && r.vendor_id === t.vendor_id && r.date >= t.date && r.id !== t.id,
    );
    if (recovered) continue;
    alerts.push({
      id: `failed-${t.id}`,
      severity: "urgent",
      title: `Payment failed: ${t.vendors?.name ?? "Unknown vendor"} ${formatCents(t.amount_cents)}`,
      detail: `${formatDate(t.date)}${t.card_last4 ? ` · card ••${t.card_last4}` : ""}${t.description ? ` · ${t.description}` : ""}`,
      source: sourceLabel(t),
      href: t.gmail_url ?? "/spend?tab=log&status=failed",
      external: !!t.gmail_url,
    });
  }

  for (const p of (payables ?? []) as Payable[]) {
    if (!p.due_date) continue;
    const late = daysBetween(p.due_date, today);
    if (late > 0) {
      alerts.push({
        id: `overdue-${p.id}`,
        severity: "urgent",
        title: `Overdue ${late}d: ${p.vendors?.name ? `${p.vendors.name} — ` : ""}${p.description}`,
        detail: `${p.amount_cents === null ? "Amount unknown" : formatCents(p.amount_cents)} · due ${formatDate(p.due_date)}${p.next_step ? ` · next: ${p.next_step}` : ""}`,
        source: "Outstanding — To Pay",
        href: "/spend?tab=outstanding",
      });
    } else if (late >= -3) {
      alerts.push({
        id: `due-${p.id}`,
        severity: "warning",
        title: `Due ${late === 0 ? "today" : `in ${-late}d`}: ${p.vendors?.name ? `${p.vendors.name} — ` : ""}${p.description}`,
        detail: `${p.amount_cents === null ? "Amount unknown" : formatCents(p.amount_cents)} · ${p.priority}${p.owner ? ` · ${p.owner}` : ""}`,
        source: "Outstanding — To Pay",
        href: "/spend?tab=outstanding",
      });
    }
  }

  const vs = (vendors ?? []) as Vendor[];
  for (const v of vs.filter((v) => v.status === "Failing" || v.status === "Suspended")) {
    alerts.push({
      id: `vendor-${v.id}`,
      severity: "urgent",
      title: `${v.name} is ${v.status}`,
      detail: v.action_note ?? "Check the payment method on this account.",
      source: "Monthly Payments",
      href: "/spend?tab=monthly",
    });
  }

  // Duplicate subscriptions: vendors explicitly marked Duplicate, or the same
  // normalized name billed both monthly and annually.
  const byName = new Map<string, Vendor[]>();
  for (const v of vs.filter((v) => v.status !== "Cancelled")) {
    const key = v.name.toLowerCase().replace(/\b(monthly|annual|yearly)\b/g, "").replace(/[^a-z0-9]/g, "");
    byName.set(key, [...(byName.get(key) ?? []), v]);
  }
  for (const group of byName.values()) {
    const cycles = new Set(group.map((v) => v.billing_cycle));
    if (group.length > 1 && cycles.has("monthly") && cycles.has("annual")) {
      alerts.push({
        id: `dup-${group[0].id}`,
        severity: "warning",
        title: `Possible duplicate subscription: ${group.map((v) => v.name).join(" + ")}`,
        detail: "Billed both monthly and annually. Cancel one.",
        source: "Monthly Payments",
        href: "/spend?tab=monthly",
      });
    }
  }
  for (const v of vs.filter((v) => v.status === "Duplicate")) {
    alerts.push({
      id: `dupflag-${v.id}`,
      severity: "warning",
      title: `Duplicate subscription: ${v.name}`,
      detail: v.action_note ?? "Marked Duplicate on Monthly Payments — cancel it.",
      source: "Monthly Payments",
      href: "/spend?tab=monthly",
    });
  }

  if (reviewCount) {
    alerts.push({
      id: "needs-review",
      severity: "info",
      title: reviewCount === 1 ? "1 receipt needs review" : `${reviewCount} receipts need review`,
      detail: "Low-confidence or incomplete AI extractions. Not counted in totals until confirmed.",
      source: "AI receipt parser",
      href: "/spend/review",
    });
  }

  const order: Record<AlertSeverity, number> = { urgent: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

function sourceLabel(t: TransactionWithVendor): string {
  if (t.source === "gmail") return "Gmail receipt";
  if (t.source === "upload") return "Uploaded receipt";
  if (t.source_id.startsWith("seed:")) return "Spend Log spreadsheet";
  if (t.source === "api") return "API";
  return "Manual entry";
}
