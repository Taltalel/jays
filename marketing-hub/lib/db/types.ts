/** Row shapes for the tables in supabase/migrations/0001_init.sql. */

export const VENDOR_STATUSES = ["Active", "Failing", "Suspended", "Paused", "Cancelled", "Duplicate"] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export const BILLING_CYCLES = ["monthly", "annual", "variable", "quarterly", "one-time"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const TXN_STATUSES = ["paid", "due", "failed", "refund"] as const;
export type TxnStatus = (typeof TXN_STATUSES)[number];

export const TXN_SOURCES = ["gmail", "upload", "api", "manual"] as const;
export type TxnSource = (typeof TXN_SOURCES)[number];

export const PAYABLE_PRIORITIES = ["Urgent", "This week", "Decide"] as const;
export type PayablePriority = (typeof PAYABLE_PRIORITIES)[number];

export const PAYABLE_STATUSES = ["open", "paid", "disputed", "cancelled"] as const;
export type PayableStatus = (typeof PAYABLE_STATUSES)[number];

/** Channels used for budgets and spend grouping. */
export const CHANNELS = [
  "Meta/Instagram",
  "Google Ads",
  "Email",
  "Website/GA4",
  "Google Business Profile",
  "Influencers & Media",
  "Print",
  "Events",
  "Reservations",
  "Software & Tools",
  "Agency",
  "Other",
] as const;

export const BRANDS = ["Jay's", "Room 7", "YES Hospitality", "Other"] as const;

export interface Vendor {
  id: string;
  name: string;
  aliases: string[];
  channel: string | null;
  brand: string | null;
  billing_cycle: BillingCycle;
  usual_amount_cents: number | null;
  billing_day: number | null;
  method_last4: string | null;
  status: VendorStatus;
  action_note: string | null;
  notes: string | null;
}

export interface Transaction {
  id: string;
  date: string;
  vendor_id: string | null;
  amount_cents: number;
  status: TxnStatus;
  period_start: string | null;
  period_end: string | null;
  invoice_ref: string | null;
  description: string | null;
  channel: string | null;
  brand: string | null;
  card_last4: string | null;
  source: TxnSource;
  source_id: string;
  gmail_url: string | null;
  storage_path: string | null;
  parsed_confidence: number | null;
  needs_review: boolean;
  review_note: string | null;
  created_at: string;
}

export interface TransactionWithVendor extends Transaction {
  vendors: Pick<Vendor, "id" | "name" | "channel" | "brand"> | null;
}

export interface Payable {
  id: string;
  vendor_id: string | null;
  description: string;
  amount_cents: number | null;
  due_date: string | null;
  priority: PayablePriority;
  owner: string | null;
  status: PayableStatus;
  next_step: string | null;
  resolved_at: string | null;
  resolved_ref: string | null;
  vendors?: Pick<Vendor, "id" | "name"> | null;
}

export interface Budget {
  id: string;
  month: string;
  channel: string;
  amount_cents: number;
}

export interface IntegrationRow {
  key: string;
  status: "ok" | "error";
  last_check_at: string;
  last_error: string | null;
}

export interface SyncRun {
  id: string;
  source: string;
  started_at: string;
  finished_at: string | null;
  rows: number | null;
  error: string | null;
}

export function effectiveChannel(t: TransactionWithVendor): string {
  return t.channel ?? t.vendors?.channel ?? "Other";
}

export function effectiveBrand(t: TransactionWithVendor): string {
  return t.brand ?? t.vendors?.brand ?? "—";
}
