"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import {
  BILLING_CYCLES,
  PAYABLE_PRIORITIES,
  TXN_STATUSES,
  VENDOR_STATUSES,
} from "@/lib/db/types";
import { parseMoneyToCents } from "@/lib/money";
import { last4, maskAccountNumbers } from "@/lib/redact";
import { findDuplicate } from "@/lib/spend/book";
import { isIsoDate, nyDate } from "@/lib/time";
import { findOrCreateVendor } from "@/lib/vendors";

function str(fd: FormData, key: string, max = 500): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = maskAccountNumbers(v.trim()).slice(0, max);
  return t === "" ? null : t;
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function back(path: string, params: Record<string, string>): never {
  const qs = new URLSearchParams(params).toString();
  redirect(`${path}${path.includes("?") ? "&" : "?"}${qs}`);
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export async function addExpense(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const returnTo = "/spend?tab=log";

  const vendorName = str(fd, "vendor", 120);
  const date = str(fd, "date");
  const amount = parseMoneyToCents(str(fd, "amount"));
  if (!vendorName || !isIsoDate(date) || amount === null) {
    back(returnTo, { error: "Vendor, date and amount are required." });
  }
  const status = oneOf(str(fd, "status"), TXN_STATUSES, "paid");
  const vendorId = await findOrCreateVendor(supabase, vendorName, {
    channel: str(fd, "channel"),
    brand: str(fd, "brand"),
  });
  const cents = status === "refund" ? -Math.abs(amount) : amount;
  const invoiceRef = str(fd, "invoice_ref", 120);

  const dup = await findDuplicate(supabase, vendorId, cents, date, status, invoiceRef);
  if (dup && fd.get("allow_duplicate") !== "on") {
    back(returnTo, { error: "This looks like a duplicate (same vendor, amount, date and status). Tick “save anyway” to add it." });
  }

  const { error } = await supabase.from("transactions").insert({
    date,
    vendor_id: vendorId,
    amount_cents: cents,
    status,
    invoice_ref: invoiceRef,
    description: str(fd, "description"),
    channel: str(fd, "channel"),
    brand: str(fd, "brand"),
    card_last4: last4(str(fd, "card_last4")),
    period_start: isIsoDate(str(fd, "period_start")) ? str(fd, "period_start") : null,
    period_end: isIsoDate(str(fd, "period_end")) ? str(fd, "period_end") : null,
    source: "manual",
    source_id: `manual:${randomUUID()}`,
  });
  if (error) back(returnTo, { error: error.message });
  revalidatePath("/", "layout");
  back(returnTo, { ok: "Expense added." });
}

// ---------------------------------------------------------------------------
// Needs-review queue
// ---------------------------------------------------------------------------

export async function approveTransaction(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const id = str(fd, "id");
  const vendorName = str(fd, "vendor", 120);
  const date = str(fd, "date");
  const amount = parseMoneyToCents(str(fd, "amount"));
  if (!id || !vendorName || !isIsoDate(date) || amount === null) {
    back("/spend/review", { error: "Vendor, date and amount are required to approve." });
  }
  const status = oneOf(str(fd, "status"), TXN_STATUSES, "paid");
  const vendorId = await findOrCreateVendor(supabase, vendorName, { channel: str(fd, "channel"), brand: str(fd, "brand") });
  const { error } = await supabase
    .from("transactions")
    .update({
      vendor_id: vendorId,
      date,
      amount_cents: status === "refund" ? -Math.abs(amount) : amount,
      status,
      invoice_ref: str(fd, "invoice_ref", 120),
      description: str(fd, "description"),
      channel: str(fd, "channel"),
      brand: str(fd, "brand"),
      card_last4: last4(str(fd, "card_last4")),
      needs_review: false,
      review_note: null,
    })
    .eq("id", id);
  if (error) back("/spend/review", { error: error.message });
  revalidatePath("/", "layout");
  back("/spend/review", { ok: "Approved and booked." });
}

export async function rejectTransaction(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const id = str(fd, "id");
  if (!id) back("/spend/review", { error: "Missing id." });
  // The Gmail message stays in processed_emails, so it won't be re-imported.
  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("needs_review", true);
  if (error) back("/spend/review", { error: error.message });
  revalidatePath("/", "layout");
  back("/spend/review", { ok: "Removed. It won't be imported again." });
}

// ---------------------------------------------------------------------------
// Outstanding — To Pay
// ---------------------------------------------------------------------------

export async function addPayable(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const returnTo = "/spend?tab=outstanding";
  const description = str(fd, "description");
  if (!description) back(returnTo, { error: "Description is required." });
  const vendorName = str(fd, "vendor", 120);
  const vendorId = vendorName ? await findOrCreateVendor(supabase, vendorName) : null;
  const due = str(fd, "due_date");
  const { error } = await supabase.from("payables").insert({
    vendor_id: vendorId,
    description,
    amount_cents: parseMoneyToCents(str(fd, "amount")),
    due_date: isIsoDate(due) ? due : null,
    priority: oneOf(str(fd, "priority"), PAYABLE_PRIORITIES, "Decide"),
    owner: str(fd, "owner", 80),
    next_step: str(fd, "next_step"),
  });
  if (error) back(returnTo, { error: error.message });
  revalidatePath("/", "layout");
  back(returnTo, { ok: "Added." });
}

export async function resolvePayable(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const returnTo = "/spend?tab=outstanding";
  const id = str(fd, "id");
  const action = str(fd, "action");
  if (!id) back(returnTo, { error: "Missing id." });

  if (action === "paid") {
    const date = str(fd, "resolved_at");
    const ref = str(fd, "resolved_ref", 120);
    if (!isIsoDate(date) || !ref) back(returnTo, { error: "To mark Paid, enter the payment date and a reference." });
    const { error } = await supabase
      .from("payables")
      .update({ status: "paid", resolved_at: date, resolved_ref: ref })
      .eq("id", id);
    if (error) back(returnTo, { error: error.message });
  } else if (action === "disputed") {
    const note = str(fd, "resolved_ref", 300);
    const { error } = await supabase
      .from("payables")
      .update({ status: "disputed", resolved_at: nyDate(), resolved_ref: note, next_step: note ?? undefined })
      .eq("id", id);
    if (error) back(returnTo, { error: error.message });
  } else if (action === "reopen") {
    const { error } = await supabase
      .from("payables")
      .update({ status: "open", resolved_at: null, resolved_ref: null })
      .eq("id", id);
    if (error) back(returnTo, { error: error.message });
  } else {
    back(returnTo, { error: "Unknown action." });
  }
  revalidatePath("/", "layout");
  back(returnTo, { ok: "Updated." });
}

// ---------------------------------------------------------------------------
// Monthly Payments (vendor billing details)
// ---------------------------------------------------------------------------

export async function updateVendor(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const returnTo = "/spend?tab=monthly";
  const id = str(fd, "id");
  if (!id) back(returnTo, { error: "Missing id." });
  const day = Number(str(fd, "billing_day"));
  const { error } = await supabase
    .from("vendors")
    .update({
      status: oneOf(str(fd, "status"), VENDOR_STATUSES, "Active"),
      billing_cycle: oneOf(str(fd, "billing_cycle"), BILLING_CYCLES, "monthly"),
      usual_amount_cents: parseMoneyToCents(str(fd, "usual_amount")),
      billing_day: Number.isInteger(day) && day >= 1 && day <= 31 ? day : null,
      method_last4: last4(str(fd, "method_last4")),
      channel: str(fd, "channel"),
      brand: str(fd, "brand"),
      action_note: str(fd, "action_note"),
    })
    .eq("id", id);
  if (error) back(returnTo, { error: error.message });
  revalidatePath("/", "layout");
  back(returnTo, { ok: "Saved." });
}

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------

export async function saveBudgets(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const month = str(fd, "month");
  const returnTo = `/spend?tab=budgets&month=${month?.slice(0, 7) ?? ""}`;
  if (!isIsoDate(month) || !month.endsWith("-01")) back(returnTo, { error: "Bad month." });

  const upserts: { month: string; channel: string; amount_cents: number }[] = [];
  const deletes: string[] = [];
  for (const [key, value] of fd.entries()) {
    if (!key.startsWith("budget:") || typeof value !== "string") continue;
    const channel = key.slice("budget:".length).slice(0, 80);
    const cents = parseMoneyToCents(value);
    if (value.trim() === "") deletes.push(channel);
    else if (cents !== null && cents >= 0) upserts.push({ month, channel, amount_cents: cents });
  }
  if (upserts.length) {
    const { error } = await supabase.from("budgets").upsert(upserts, { onConflict: "month,channel" });
    if (error) back(returnTo, { error: error.message });
  }
  if (deletes.length) {
    await supabase.from("budgets").delete().eq("month", month).in("channel", deletes);
  }
  revalidatePath("/", "layout");
  back(returnTo, { ok: "Budgets saved." });
}
