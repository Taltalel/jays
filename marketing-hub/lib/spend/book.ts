import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParseResult } from "@/lib/ai/receipt";
import type { TxnSource } from "@/lib/db/types";
import { findOrCreateVendor } from "@/lib/vendors";

export type BookOutcome = "booked" | "needs_review" | "duplicate";

export interface BookInput {
  result: ParseResult;
  source: TxnSource;
  sourceId: string;
  gmailUrl?: string | null;
  storagePath?: string | null;
  /** Fallback date when the parser found none (e.g. the email's date). */
  fallbackDate?: string;
}

/**
 * Turn a parsed receipt into a transaction row.
 * - Low-confidence or incomplete results are saved with needs_review = true,
 *   which keeps them out of every total until confirmed.
 * - Dedupes on vendor + amount + date (+ status), or vendor + invoice ref.
 */
export async function bookParsedReceipt(db: SupabaseClient, input: BookInput) {
  const { parsed, amountCents, needsReview, reviewReasons } = input.result;
  const date = parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : input.fallbackDate;
  if (!date) throw new Error("No date for transaction");

  const vendorId = parsed.vendor
    ? await findOrCreateVendor(db, parsed.vendor, {
        channel: parsed.suggested_channel,
        brand: parsed.suggested_brand,
      })
    : null;

  const status = parsed.status ?? "due";
  const dup = vendorId && amountCents !== null ? await findDuplicate(db, vendorId, amountCents, date, status, parsed.invoice_ref) : null;
  if (dup) return { outcome: "duplicate" as BookOutcome, transactionId: dup };

  const row = {
    date,
    vendor_id: vendorId,
    amount_cents: amountCents ?? 0,
    status,
    period_start: validDate(parsed.period_start),
    period_end: validDate(parsed.period_end),
    invoice_ref: parsed.invoice_ref,
    description: parsed.description,
    channel: parsed.suggested_channel,
    brand: parsed.suggested_brand,
    card_last4: parsed.card_last4,
    source: input.source,
    source_id: input.sourceId,
    gmail_url: input.gmailUrl ?? null,
    storage_path: input.storagePath ?? null,
    parsed_confidence: Number(parsed.confidence.toFixed(3)),
    needs_review: needsReview,
    review_note: [...reviewReasons, parsed.notes].filter(Boolean).join(" · ") || null,
  };

  const { data, error } = await db
    .from("transactions")
    .upsert(row, { onConflict: "source,source_id", ignoreDuplicates: true })
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`transaction insert failed: ${error.message}`);
  if (!data) return { outcome: "duplicate" as BookOutcome, transactionId: null };
  return { outcome: (needsReview ? "needs_review" : "booked") as BookOutcome, transactionId: data.id as string };
}

export async function findDuplicate(
  db: SupabaseClient,
  vendorId: string,
  amountCents: number,
  date: string,
  status: string,
  invoiceRef: string | null,
): Promise<string | null> {
  if (invoiceRef) {
    const { data } = await db
      .from("transactions")
      .select("id")
      .eq("vendor_id", vendorId)
      .eq("invoice_ref", invoiceRef)
      .eq("status", status)
      .limit(1);
    if (data?.[0]) return data[0].id;
  }
  const { data } = await db
    .from("transactions")
    .select("id")
    .eq("vendor_id", vendorId)
    .eq("amount_cents", amountCents)
    .eq("date", date)
    .eq("status", status)
    .limit(1);
  return data?.[0]?.id ?? null;
}

function validDate(s: string | null): string | null {
  return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}
