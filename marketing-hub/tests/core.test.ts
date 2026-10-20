import assert from "node:assert/strict";
import { test } from "node:test";
import { finalize, type ParsedReceipt } from "@/lib/ai/receipt";
import { receiptQuery } from "@/lib/gmail/sync";
import { formatCents, parseMoneyToCents } from "@/lib/money";
import { last4, maskAccountNumbers, redactSecrets } from "@/lib/redact";
import { addMonths, daysInMonth, nyDate } from "@/lib/time";
import { matchVendor, normalizeVendorName } from "@/lib/vendors";

test("money parses to integer cents", () => {
  assert.equal(parseMoneyToCents("$1,234.56"), 123456);
  assert.equal(parseMoneyToCents("12"), 1200);
  assert.equal(parseMoneyToCents("12.5"), 1250);
  assert.equal(parseMoneyToCents("(40.00)"), -4000);
  assert.equal(parseMoneyToCents("-3.10"), -310);
  assert.equal(parseMoneyToCents(19.99), 1999);
  assert.equal(parseMoneyToCents(0.1 + 0.2), 30);
  assert.equal(parseMoneyToCents("Variable"), null);
  assert.equal(parseMoneyToCents(""), null);
  assert.equal(formatCents(123456), "$1,234.56");
});

test("card numbers: only last 4 survive", () => {
  assert.equal(last4("4242 4242 4242 4242"), "4242");
  assert.equal(last4("Visa ending 1234"), "1234");
  assert.equal(last4("12"), null);
  const masked = maskAccountNumbers("Card 4111-1111-1111-1111 and acct 000123456789, invoice 2026 total 45.00");
  assert.ok(!masked.includes("4111-1111"));
  assert.ok(masked.includes("••••1111"));
  assert.ok(masked.includes("••••6789"));
  assert.ok(masked.includes("invoice 2026"));
});

test("secrets are stripped from error text", () => {
  const s = redactSecrets("failed: Bearer ya29.a0AfH6SMBabc refresh_token=1//0gabcdefg sk-ant-api03-xyz");
  assert.ok(!s.includes("ya29"));
  assert.ok(!s.includes("1//0g"));
  assert.ok(!s.includes("sk-ant"));
});

test("New York dates", () => {
  // 03:30 UTC on Oct 17 is still Oct 16 in New York.
  assert.equal(nyDate(new Date("2026-10-17T03:30:00Z")), "2026-10-16");
  assert.equal(addMonths("2026-12-01", 1), "2027-01-01");
  assert.equal(daysInMonth("2026-02-01"), 28);
});

const base: ParsedReceipt = {
  is_receipt: true,
  vendor: "Meta",
  amount: "125.40",
  currency: "USD",
  date: "2026-10-03",
  invoice_ref: "TX-1",
  status: "paid",
  card_last4: "4242",
  period_start: null,
  period_end: null,
  billing_cycle: "unknown",
  suggested_channel: "Meta/Instagram",
  suggested_brand: "Jay's",
  description: "Boost",
  confidence: 0.95,
  notes: null,
};

test("receipt finalize: confident result books", () => {
  const r = finalize(base);
  assert.equal(r.amountCents, 12540);
  assert.equal(r.needsReview, false);
});

test("receipt finalize: low confidence or missing fields go to review", () => {
  assert.equal(finalize({ ...base, confidence: 0.5 }).needsReview, true);
  assert.equal(finalize({ ...base, amount: null }).needsReview, true);
  assert.equal(finalize({ ...base, date: "October 3" }).needsReview, true);
  assert.equal(finalize({ ...base, currency: "EUR" }).needsReview, true);
});

test("receipt finalize: refunds negative, card trimmed to 4", () => {
  const r = finalize({ ...base, status: "refund", card_last4: "4111111111111111" });
  assert.equal(r.amountCents, -12540);
  assert.equal(r.parsed.card_last4, "1111");
});

test("gmail query is receipt-focused and dated", () => {
  const q = receiptQuery("2026-09-01");
  assert.ok(q.startsWith("after:2026/09/01 {"));
  assert.ok(q.includes("subject:invoice"));
  assert.ok(q.includes('subject:"past due"'));
  assert.ok(q.includes("-from:noreply@order.eventbrite.com"), "ticket sales are not spend");
});

test("vendor matching ignores case, punctuation and suffixes", () => {
  assert.equal(normalizeVendorName("Meta Platforms, Inc."), "metaplatforms");
  const vs = [{ id: "1", name: "Mailchimp", aliases: ["Intuit Mailchimp"] }];
  assert.equal(matchVendor(vs, "MAILCHIMP")?.id, "1");
  assert.equal(matchVendor(vs, "Intuit Mailchimp")?.id, "1");
  assert.equal(matchVendor(vs, "Canva"), null);
});
