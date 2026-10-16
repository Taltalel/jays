import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { BRANDS, CHANNELS } from "@/lib/db/types";
import { requireEnv } from "@/lib/env";
import { last4, maskAccountNumbers } from "@/lib/redact";

export const RECEIPT_MODEL = "claude-sonnet-5-5";

/** Below this, a parsed receipt goes to "Needs review" and is never auto-booked. */
export const REVIEW_THRESHOLD = 0.8;

const ReceiptSchema = z.object({
  is_receipt: z
    .boolean()
    .describe("True only if this is a receipt, invoice, bill, payment confirmation, refund or failed/declined payment notice."),
  vendor: z.string().nullable().describe("The company being paid, e.g. 'Meta', 'Mailchimp', 'Canva'. Not the payment processor unless it is the only name."),
  amount: z
    .string()
    .nullable()
    .describe("Total charged/due/refunded in USD as a plain decimal string like '1234.56'. No currency symbol."),
  currency: z.string().nullable().describe("ISO currency code, usually USD."),
  date: z.string().nullable().describe("Charge, invoice or failure date as YYYY-MM-DD."),
  invoice_ref: z.string().nullable().describe("Invoice, receipt, order or transaction reference number."),
  status: z.enum(["paid", "due", "failed", "refund"]).nullable(),
  card_last4: z
    .string()
    .nullable()
    .describe("ONLY the last 4 digits of the card or account used, e.g. '4242'. Never more than 4 digits."),
  period_start: z.string().nullable().describe("Start of the service period covered, YYYY-MM-DD."),
  period_end: z.string().nullable().describe("End of the service period covered, YYYY-MM-DD."),
  billing_cycle: z.enum(["monthly", "annual", "quarterly", "one-time", "unknown"]),
  suggested_channel: z.enum(CHANNELS).nullable(),
  suggested_brand: z.enum(BRANDS).nullable(),
  description: z.string().nullable().describe("A short plain-English line, e.g. 'Instagram boost — Omakase Oct 22'."),
  confidence: z.number().describe("0 to 1: how sure you are that vendor, amount, date and status are all correct."),
  notes: z.string().nullable().describe("Anything ambiguous a human should check."),
});

export type ParsedReceipt = z.infer<typeof ReceiptSchema>;

const SYSTEM = `You extract bookkeeping fields from marketing receipts for Jay's Fort Lauderdale, a restaurant (part of Room 7 / YES Hospitality Group). Inbox: marketing@yesfbm.com.

Rules:
- Never output a full card, bank or account number. card_last4 is the last 4 digits only, or null.
- Use null when a field isn't stated. Do not guess amounts or dates.
- status: "paid" for a successful charge or receipt, "due" for an unpaid invoice or upcoming bill, "failed" for a declined/failed/past-due payment notice, "refund" for money returned.
- Amount is the total for this document. For "failed", the amount that failed to charge.
- Marketing newsletters, promos, shipping updates and account notices without money are is_receipt=false.
- Channel hints: Meta/Facebook/Instagram ads → "Meta/Instagram"; Google Ads → "Google Ads"; Mailchimp → "Email"; website hosting/domains/analytics → "Website/GA4"; OpenTable/Resy → "Reservations"; influencers, PR, magazines → "Influencers & Media"; printing → "Print"; Eventbrite/event supplies → "Events"; design/software subscriptions → "Software & Tools"; agencies/retainers → "Agency".
- confidence reflects the weakest of vendor, amount, date and status.`;

export type ReceiptInput =
  | { kind: "email"; from: string; subject: string; date: string; text: string; attachments: FileInput[] }
  | { kind: "file"; file: FileInput; filename: string };

export interface FileInput {
  mediaType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  base64: string;
}

export interface ParseResult {
  parsed: ParsedReceipt;
  amountCents: number | null;
  needsReview: boolean;
  reviewReasons: string[];
}

function fileBlock(f: FileInput): Anthropic.Beta.BetaContentBlockParam {
  if (f.mediaType === "application/pdf") {
    return { type: "document", source: { type: "base64", media_type: f.mediaType, data: f.base64 } };
  }
  return { type: "image", source: { type: "base64", media_type: f.mediaType, data: f.base64 } };
}

export async function parseReceipt(input: ReceiptInput): Promise<ParseResult> {
  const client = new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (input.kind === "email") {
    for (const a of input.attachments) content.push(fileBlock(a));
    content.push({
      type: "text",
      text: [
        `From: ${input.from}`,
        `Subject: ${input.subject}`,
        `Date: ${input.date}`,
        "",
        // Account numbers are masked before anything leaves our server.
        maskAccountNumbers(input.text).slice(0, 30_000),
      ].join("\n"),
    });
  } else {
    content.push(fileBlock(input.file));
    content.push({ type: "text", text: `Uploaded file: ${input.filename}. Extract the receipt fields.` });
  }

  const response = await client.beta.messages.parse({
    model: RECEIPT_MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(ReceiptSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`Receipt parser returned no result (stop_reason: ${response.stop_reason})`);
  }

  return finalize(response.parsed_output);
}

/** Post-process model output: enforce last-4, convert money, decide review. */
export function finalize(raw: ParsedReceipt): ParseResult {
  const parsed: ParsedReceipt = {
    ...raw,
    card_last4: last4(raw.card_last4),
    description: raw.description ? maskAccountNumbers(raw.description) : null,
    notes: raw.notes ? maskAccountNumbers(raw.notes) : null,
    invoice_ref: raw.invoice_ref ? raw.invoice_ref.slice(0, 120) : null,
    confidence: Math.min(1, Math.max(0, raw.confidence)),
  };

  let amountCents: number | null = null;
  if (parsed.amount) {
    const m = /^-?\d+(?:\.\d{1,2})?$/.exec(parsed.amount.replace(/[$,\s]/g, ""));
    if (m) amountCents = Math.round(Number(m[0]) * 100);
  }
  if (amountCents !== null && parsed.status === "refund" && amountCents > 0) amountCents = -amountCents;

  const reasons: string[] = [];
  if (parsed.confidence < REVIEW_THRESHOLD) reasons.push(`Low confidence (${Math.round(parsed.confidence * 100)}%)`);
  if (!parsed.vendor) reasons.push("No vendor found");
  if (amountCents === null) reasons.push("No amount found");
  if (!parsed.date || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) reasons.push("No valid date");
  if (!parsed.status) reasons.push("No status");
  if (parsed.currency && parsed.currency.toUpperCase() !== "USD") reasons.push(`Currency is ${parsed.currency}`);

  return { parsed, amountCents, needsReview: reasons.length > 0, reviewReasons: reasons };
}
