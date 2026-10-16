import "server-only";
import { parseReceipt, type FileInput } from "@/lib/ai/receipt";
import { env } from "@/lib/env";
import { errorMessage } from "@/lib/redact";
import { bookParsedReceipt } from "@/lib/spend/book";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { addDays, nyDate } from "@/lib/time";
import {
  getAttachment,
  getMessage,
  gmailConfigured,
  gmailWebUrl,
  header,
  listMessageIds,
  messageText,
  pdfAttachments,
} from "./client";

const SUBJECT_TERMS = [
  "receipt",
  "invoice",
  "payment",
  "billing",
  "bill",
  "charged",
  "charge",
  "declined",
  "failed",
  "renewal",
  "subscription",
  "refund",
  "order",
  "statement",
  "past due",
  "overdue",
];

const MAX_PER_RUN = 30;
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const TIME_BUDGET_MS = 240_000;
const MAX_ATTEMPTS = 3;

export interface GmailSyncSummary {
  scanned: number;
  booked: number;
  needsReview: number;
  notReceipt: number;
  duplicate: number;
  errors: number;
  remaining: number;
}

/** Gmail search query for receipt-like emails since `after` (YYYY-MM-DD). */
export function receiptQuery(after: string): string {
  const subj = SUBJECT_TERMS.map((t) => (t.includes(" ") ? `subject:"${t}"` : `subject:${t}`)).join(" ");
  return `after:${after.replace(/-/g, "/")} {${subj}} -in:chats -in:drafts -in:sent`;
}

export async function runGmailSync(): Promise<GmailSyncSummary> {
  if (!gmailConfigured()) throw new Error("Gmail is not connected (missing env vars)");
  const db = supabaseAdmin();
  const started = Date.now();

  const { data: run } = await db.from("sync_runs").insert({ source: "gmail" }).select("id").single();
  const summary: GmailSyncSummary = { scanned: 0, booked: 0, needsReview: 0, notReceipt: 0, duplicate: 0, errors: 0, remaining: 0 };

  try {
    const { data: last } = await db
      .from("sync_runs")
      .select("started_at")
      .eq("source", "gmail")
      .is("error", null)
      .not("finished_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(1);
    const backfillFrom = env("GMAIL_BACKFILL_FROM") ?? "2026-01-01";
    // Overlap by 3 days so late-arriving or re-labelled mail isn't missed;
    // processed_emails prevents double parsing.
    const after = last?.[0] ? addDays(nyDate(new Date(last[0].started_at)), -3) : backfillFrom;

    const ids = await listMessageIds(receiptQuery(after), 500);
    const seen = new Map<string, { outcome: string; attempts: number }>();
    for (let i = 0; i < ids.length; i += 100) {
      const { data } = await db
        .from("processed_emails")
        .select("message_id, outcome, attempts")
        .in("message_id", ids.slice(i, i + 100));
      for (const r of data ?? []) seen.set(r.message_id, r);
    }
    const isDone = (id: string) => {
      const s = seen.get(id);
      return !!s && (s.outcome !== "error" || s.attempts >= MAX_ATTEMPTS);
    };
    // Oldest first so a backfill progresses chronologically across runs.
    const todo = ids.filter((id) => !isDone(id)).reverse();

    for (const id of todo) {
      if (summary.scanned >= MAX_PER_RUN || Date.now() - started > TIME_BUDGET_MS) break;
      summary.scanned++;
      try {
        const msg = await getMessage(id);
        const attachments: FileInput[] = [];
        for (const a of pdfAttachments(msg).slice(0, 2)) {
          if (a.size > MAX_PDF_BYTES) continue;
          attachments.push({ mediaType: "application/pdf", base64: await getAttachment(id, a.attachmentId) });
        }
        const emailDate = nyDate(new Date(Number(msg.internalDate)));
        const result = await parseReceipt({
          kind: "email",
          from: header(msg, "From"),
          subject: header(msg, "Subject"),
          date: emailDate,
          text: messageText(msg),
          attachments,
        });

        if (!result.parsed.is_receipt) {
          summary.notReceipt++;
          await db.from("processed_emails").upsert({ message_id: id, outcome: "not_receipt" });
          continue;
        }

        const booked = await bookParsedReceipt(db, {
          result,
          source: "gmail",
          sourceId: id,
          gmailUrl: gmailWebUrl(id),
          fallbackDate: emailDate,
        });
        if (booked.outcome === "booked") summary.booked++;
        else if (booked.outcome === "needs_review") summary.needsReview++;
        else summary.duplicate++;
        await db.from("processed_emails").upsert({
          message_id: id,
          outcome: booked.outcome,
          transaction_id: booked.transactionId,
        });
      } catch (e) {
        summary.errors++;
        // Retried on later runs until MAX_ATTEMPTS, then left for a human.
        await db.from("processed_emails").upsert({
          message_id: id,
          outcome: "error",
          attempts: (seen.get(id)?.attempts ?? 0) + 1,
          detail: errorMessage(e),
        });
      }
    }
    summary.remaining = Math.max(0, todo.length - summary.scanned);

    await db
      .from("sync_runs")
      .update({ finished_at: new Date().toISOString(), rows: summary.booked + summary.needsReview })
      .eq("id", run?.id);
    return summary;
  } catch (e) {
    await db
      .from("sync_runs")
      .update({ finished_at: new Date().toISOString(), error: errorMessage(e) })
      .eq("id", run?.id);
    throw e;
  }
}
