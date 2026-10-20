import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import ExcelJS from "exceljs";
import { parseSeedWorkbook } from "@/lib/spend/seed-parse";

/** Synthetic workbook shaped like the real one (made-up rows). */
async function makeWorkbook() {
  const wb = new ExcelJS.Workbook();
  const m = wb.addWorksheet("Monthly Payments");
  m.addRow(["Jay's — Monthly Payments"]);
  m.addRow(["Vendor", "Channel", "Usual amount", "Billing day", "Card (last 4)", "Status", "Action note", "Jan", "Feb"]);
  m.addRow(["Canva", "Software & Tools", "$14.99", "12th", "Visa 4242", "Active", "", 14.99, 14.99]);
  m.addRow(["Meta Ads", "Meta/Instagram", "Variable", 1, "1111", "Failing", "Update card", 300, 410]);
  m.addRow(["Canva (Annual)", "Software & Tools", "$119.99", "3", "", "Active", "", "", ""]);
  m.addRow(["TOTAL", "", "", "", "", "", "", 314.99, 424.99]);

  const o = wb.addWorksheet("Outstanding — To Pay");
  o.addRow(["Vendor", "Item", "Amount", "Due date", "Priority", "Owner", "Status", "Next step"]);
  o.addRow(["Lifestyle Media", "Oct print ad", 850, new Date(Date.UTC(2026, 9, 20)), "Urgent", "Tal", "Open", "Pay by card"]);
  o.addRow(["Reimagine Media", "Invoice 044", "", "", "Decide", "", "Disputed", "Email them"]);

  const l = wb.addWorksheet("Spend Log");
  l.addRow(["Date", "Vendor", "Amount", "Status", "Channel", "Brand", "Invoice #", "Card", "Notes", "Link"]);
  l.addRow([new Date(Date.UTC(2026, 8, 3)), "Meta Ads", 120.5, "Paid", "Meta/Instagram", "Jay's", "TX-9", "4242", "Omakase boost",
    { text: "email", hyperlink: "https://mail.google.com/mail/u/0/#all/abc" }]);
  l.addRow(["9/3/2026", "Meta Ads", "$120.50", "Paid", "", "", "TX-9", "", "", ""]); // identical → numbered, not dropped
  l.addRow(["2026-09-10", "Mailchimp", "-20.00", "Refund", "Email", "", "", "", "", ""]);
  l.addRow(["", "Mystery", 5, "", "", "", "", "", "", ""]);
  l.addRow(["2026-09-12", "Canva", "Variable", "", "", "", "", "", "", ""]);

  const dir = mkdtempSync(join(tmpdir(), "seed-"));
  const file = join(dir, "seed.xlsx");
  await wb.xlsx.writeFile(file);
  return file;
}

test("seed workbook parses all three tabs", async () => {
  const data = await parseSeedWorkbook(await makeWorkbook());

  assert.equal(data.vendors.length, 3, "total row skipped");
  assert.equal(data.vendors.find((v) => v.name === "Canva (Annual)")!.billing_cycle, "annual");
  const canva = data.vendors.find((v) => v.name === "Canva")!;
  assert.equal(canva.usual_amount_cents, 1499);
  assert.equal(canva.billing_day, 12);
  assert.equal(canva.method_last4, "4242");
  assert.equal(canva.billing_cycle, "monthly");
  const meta = data.vendors.find((v) => v.name === "Meta Ads")!;
  assert.equal(meta.billing_cycle, "variable");
  assert.equal(meta.status, "Failing");

  assert.equal(data.payables.length, 2);
  assert.equal(data.payables[0].amount_cents, 85000);
  assert.equal(data.payables[0].due_date, "2026-10-20");
  assert.equal(data.payables[0].priority, "Urgent");
  assert.equal(data.payables[1].status, "disputed");
  assert.equal(data.payables[1].amount_cents, null);

  assert.equal(data.transactions.length, 3);
  const [a, b, refund] = data.transactions;
  assert.equal(a.date, "2026-09-03");
  assert.equal(a.amount_cents, 12050);
  assert.equal(a.gmail_url, "https://mail.google.com/mail/u/0/#all/abc");
  assert.equal(b.date, "2026-09-03");
  assert.notEqual(a.source_id, b.source_id, "identical rows get distinct ids");
  assert.equal(refund.amount_cents, -2000);
  assert.equal(refund.status, "refund");
  assert.equal(data.reports.log.skipped.length, 2);
});

test("seed ids are stable across runs (idempotent)", async () => {
  const file = await makeWorkbook();
  const one = await parseSeedWorkbook(file);
  const two = await parseSeedWorkbook(file);
  assert.deepEqual(one.transactions.map((t) => t.source_id), two.transactions.map((t) => t.source_id));
  assert.deepEqual(one.payables.map((p) => p.source_key), two.payables.map((p) => p.source_key));
});
