"use server";
import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { finalize, parseReceipt, type FileInput, type ParsedReceipt } from "@/lib/ai/receipt";
import { requireOwner } from "@/lib/auth";
import { BRANDS, CHANNELS, TXN_STATUSES } from "@/lib/db/types";
import { parseMoneyToCents } from "@/lib/money";
import { errorMessage, last4, maskAccountNumbers } from "@/lib/redact";
import { bookParsedReceipt } from "@/lib/spend/book";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isIsoDate, nyDate } from "@/lib/time";

const TYPES: Record<string, { ext: string; max: number }> = {
  "application/pdf": { ext: "pdf", max: 20 * 1024 * 1024 },
  "image/jpeg": { ext: "jpg", max: 5 * 1024 * 1024 },
  "image/png": { ext: "png", max: 5 * 1024 * 1024 },
  "image/webp": { ext: "webp", max: 5 * 1024 * 1024 },
  "image/gif": { ext: "gif", max: 5 * 1024 * 1024 },
};

/** Step 1: mint a one-time signed upload URL into the private receipts bucket. */
export async function createReceiptUpload(input: { type: string; size: number }) {
  await requireOwner({ onFail: "throw" });
  const t = TYPES[input.type];
  if (!t) return { error: "Upload a PDF, JPG, PNG, WEBP or GIF. (iPhone photos: choose “Most Compatible” or take a screenshot.)" };
  if (input.size > t.max) return { error: `File too large — max ${t.max / 1024 / 1024} MB for this type.` };

  const path = `uploads/${nyDate()}/${randomUUID()}.${t.ext}`;
  const { data, error } = await supabaseAdmin().storage.from("receipts").createSignedUploadUrl(path);
  if (error || !data) return { error: `Storage not ready: ${error?.message ?? "unknown"}` };
  return { path: data.path, token: data.token };
}

export interface ParsedForConfirm {
  path: string;
  hash: string;
  parsed: ParsedReceipt;
  amount: string;
  needsReview: boolean;
  reasons: string[];
  duplicateOf?: string;
}

/** Step 2: read the uploaded file and run the AI parser. Nothing is saved yet. */
export async function parseUploadedReceipt(path: string): Promise<{ error: string } | ParsedForConfirm> {
  const { supabase } = await requireOwner({ onFail: "throw" });
  if (!/^uploads\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.(pdf|jpg|png|webp|gif)$/.test(path)) return { error: "Bad upload path." };

  try {
    const { data: blob, error } = await supabaseAdmin().storage.from("receipts").download(path);
    if (error || !blob) return { error: `Couldn't read the upload: ${error?.message ?? "missing"}` };
    const buf = Buffer.from(await blob.arrayBuffer());
    const hash = createHash("sha256").update(buf).digest("hex");

    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("source", "upload")
      .eq("source_id", hash)
      .maybeSingle();

    const mediaType = Object.entries(TYPES).find(([, v]) => path.endsWith(`.${v.ext}`))![0] as FileInput["mediaType"];
    const result = await parseReceipt({ kind: "file", file: { mediaType, base64: buf.toString("base64") }, filename: path.split("/").pop()! });

    return {
      path,
      hash,
      parsed: result.parsed,
      amount: result.amountCents !== null ? (Math.abs(result.amountCents) / 100).toFixed(2) : "",
      needsReview: result.needsReview,
      reasons: result.reviewReasons,
      duplicateOf: existing?.id,
    };
  } catch (e) {
    return { error: `AI extraction failed: ${errorMessage(e)}` };
  }
}

/** Step 3: the confirm screen posts here. Saves as booked, or to Needs review. */
export async function confirmReceipt(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const get = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" && v.trim() !== "" ? maskAccountNumbers(v.trim()).slice(0, 300) : null;
  };

  const path = get("path");
  const hash = get("hash");
  if (!path || !hash || !/^[0-9a-f]{64}$/.test(hash)) redirect("/spend/upload?error=Missing+upload");

  const status = (TXN_STATUSES as readonly string[]).includes(get("status") ?? "") ? (get("status") as ParsedReceipt["status"]) : "paid";
  const amountCents = parseMoneyToCents(get("amount"));
  const date = get("date");
  const channel = (CHANNELS as readonly string[]).includes(get("channel") ?? "") ? (get("channel") as ParsedReceipt["suggested_channel"]) : null;
  const brand = (BRANDS as readonly string[]).includes(get("brand") ?? "") ? (get("brand") as ParsedReceipt["suggested_brand"]) : null;
  const confidence = Math.min(1, Math.max(0, Number(get("confidence") ?? 0) || 0));
  const toReview = fd.get("intent") === "review";

  const parsed: ParsedReceipt = {
    is_receipt: true,
    vendor: get("vendor"),
    amount: amountCents !== null ? (Math.abs(amountCents) / 100).toFixed(2) : null,
    currency: "USD",
    date: isIsoDate(date) ? date : null,
    invoice_ref: get("invoice_ref"),
    status,
    card_last4: last4(get("card_last4")),
    period_start: isIsoDate(get("period_start")) ? get("period_start") : null,
    period_end: isIsoDate(get("period_end")) ? get("period_end") : null,
    billing_cycle: "unknown",
    suggested_channel: channel,
    suggested_brand: brand,
    description: get("description"),
    confidence,
    notes: null,
  };

  const result = finalize(parsed);
  // A human has now checked every field: book it unless they chose review,
  // or required fields are still missing.
  const missingRequired = !parsed.vendor || result.amountCents === null || !parsed.date;
  result.needsReview = toReview || missingRequired;
  if (!result.needsReview) result.reviewReasons = [];
  else if (toReview) result.reviewReasons = ["Saved for later review", ...result.reviewReasons];

  let outcome: string;
  try {
    const booked = await bookParsedReceipt(supabase, {
      result,
      source: "upload",
      sourceId: hash,
      storagePath: path,
      fallbackDate: nyDate(),
    });
    outcome = booked.outcome;
  } catch (e) {
    redirect(`/spend/upload?error=${encodeURIComponent(errorMessage(e))}`);
  }
  revalidatePath("/", "layout");
  if (outcome === "duplicate") redirect("/spend?tab=log&error=That+receipt+is+already+in+the+Spend+Log.");
  if (outcome === "needs_review") redirect("/spend/review?ok=Saved+to+Needs+review.");
  redirect("/spend?tab=log&ok=Receipt+booked.");
}
