/**
 * Reads seed/Jays-Marketing-Spend-Log.xlsx into plain records. Pure (no DB),
 * so the column mapping can be previewed before anything is written.
 *
 * Headers are matched loosely (case, punctuation and word order don't matter),
 * because the sheet is maintained by hand.
 */
import { createHash } from "node:crypto";
import ExcelJS from "exceljs";
import { parseMoneyToCents } from "@/lib/money";
import { last4 } from "@/lib/redact";

type Cell = string | number | Date | boolean | null;

export interface SeedVendor {
  name: string;
  channel: string | null;
  brand: string | null;
  billing_cycle: "monthly" | "annual" | "variable" | "quarterly" | "one-time" | null;
  usual_amount_cents: number | null;
  billing_day: number | null;
  method_last4: string | null;
  status: "Active" | "Failing" | "Suspended" | "Paused" | "Cancelled" | "Duplicate" | null;
  action_note: string | null;
  notes: string | null;
}

export interface SeedTransaction {
  source_id: string;
  date: string;
  vendor: string;
  amount_cents: number;
  status: "paid" | "due" | "failed" | "refund";
  invoice_ref: string | null;
  description: string | null;
  channel: string | null;
  brand: string | null;
  card_last4: string | null;
  period_start: string | null;
  period_end: string | null;
  gmail_url: string | null;
}

export interface SeedPayable {
  source_key: string;
  vendor: string | null;
  description: string;
  amount_cents: number | null;
  due_date: string | null;
  priority: "Urgent" | "This week" | "Decide";
  owner: string | null;
  status: "open" | "paid" | "disputed" | "cancelled";
  next_step: string | null;
}

export interface SheetReport {
  sheet: string | null;
  headerRow: number | null;
  mapped: Record<string, string>;
  unmapped: string[];
  rows: number;
  skipped: { row: number; reason: string }[];
}

export interface SeedData {
  vendors: SeedVendor[];
  transactions: SeedTransaction[];
  payables: SeedPayable[];
  reports: { monthly: SheetReport; outstanding: SheetReport; log: SheetReport };
}

// ---------------------------------------------------------------------------
// Header aliases per sheet. Keys are our field names.
// ---------------------------------------------------------------------------

const LOG_COLS: Record<string, string[]> = {
  date: ["date", "charge date", "paid date", "date paid", "transaction date", "invoice date"],
  vendor: ["vendor", "payee", "merchant", "company", "service", "name"],
  amount: ["amount", "total", "amount usd", "charged", "cost", "price"],
  status: ["status", "payment status"],
  channel: ["channel", "category", "type"],
  brand: ["brand", "venue", "location"],
  invoice_ref: ["invoice", "invoice ref", "invoice #", "invoice no", "ref", "reference", "receipt #", "order #", "invoice/ref"],
  card: ["card", "card last 4", "last 4", "method", "payment method", "card used"],
  period_start: ["period start", "from", "service start"],
  period_end: ["period end", "to", "service end"],
  period: ["period", "period covered", "billing period"],
  description: ["description", "notes", "note", "details", "memo", "item"],
  link: ["link", "email", "email link", "source", "gmail", "url"],
};

const OUT_COLS: Record<string, string[]> = {
  vendor: ["vendor", "payee", "company", "who"],
  description: ["item", "description", "what", "for", "details"],
  amount: ["amount", "amount due", "total", "balance", "owed"],
  due_date: ["due", "due date", "pay by", "deadline"],
  priority: ["priority", "urgency"],
  owner: ["owner", "who pays", "responsible", "assigned"],
  status: ["status"],
  next_step: ["next step", "next steps", "action", "notes", "note"],
};

const MONTHLY_COLS: Record<string, string[]> = {
  vendor: ["vendor", "service", "subscription", "account", "name", "payee"],
  channel: ["channel", "category", "type"],
  brand: ["brand", "venue"],
  cycle: ["cycle", "billing cycle", "frequency", "billing", "plan"],
  usual: ["usual amount", "usual", "amount", "monthly amount", "cost", "price", "typical"],
  billing_day: ["billing day", "bills on", "day", "charge day", "renews", "renewal day"],
  card: ["card", "card last 4", "last 4", "method", "payment method"],
  status: ["status"],
  action: ["action note", "action", "next step", "to do"],
  notes: ["notes", "note", "comments"],
};

// ---------------------------------------------------------------------------

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9#]+/g, " ").trim();
}

function cellValue(v: ExcelJS.CellValue): { value: Cell; link: string | null } {
  if (v === null || v === undefined) return { value: null, link: null };
  if (v instanceof Date) return { value: v, link: null };
  if (typeof v === "object") {
    if ("hyperlink" in v) return { value: (v as { text?: string }).text ?? null, link: String(v.hyperlink) };
    if ("richText" in v) return { value: v.richText.map((r) => r.text).join(""), link: null };
    if ("result" in v) return cellValue((v as { result: ExcelJS.CellValue }).result);
    if ("error" in v) return { value: null, link: null };
    return { value: String(v), link: null };
  }
  return { value: v as Cell, link: null };
}

function text(c: Cell): string | null {
  if (c === null) return null;
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  const s = String(c).trim();
  return s === "" ? null : s;
}

/** Excel dates come back as UTC-midnight Date objects; strings are parsed too. */
export function toDate(c: Cell, fallbackYear?: number): string | null {
  if (c === null) return null;
  if (c instanceof Date) return Number.isNaN(c.getTime()) ? null : c.toISOString().slice(0, 10);
  if (typeof c === "number" && c > 20000 && c < 80000) {
    // Excel serial date
    return new Date(Date.UTC(1899, 11, 30) + c * 86400000).toISOString().slice(0, 10);
  }
  const s = String(c).trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = /^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/.exec(s);
  if (m) {
    const y = m[3] ? (m[3].length === 2 ? `20${m[3]}` : m[3]) : fallbackYear ? String(fallbackYear) : null;
    if (!y) return null;
    return `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  const t = Date.parse(s.includes(",") || /\d{4}/.test(s) ? s : `${s} ${fallbackYear ?? ""}`);
  if (!Number.isNaN(t)) {
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return null;
}

function hash(...parts: (string | number | null)[]): string {
  return createHash("sha256").update(parts.map((p) => String(p ?? "")).join("|")).digest("hex").slice(0, 24);
}

function findSheet(wb: ExcelJS.Workbook, needles: string[]): ExcelJS.Worksheet | undefined {
  return wb.worksheets.find((ws) => needles.some((n) => norm(ws.name).includes(n)));
}

interface Table {
  headerRow: number;
  columns: Map<string, number>; // field → column index
  unmapped: string[];
  rows: { row: number; get: (field: string) => Cell; link: (field: string) => string | null; raw: Map<string, Cell> }[];
  headers: Map<number, string>;
}

function readTable(ws: ExcelJS.Worksheet, aliases: Record<string, string[]>): Table | null {
  let best: { row: number; score: number } | null = null;
  for (let r = 1; r <= Math.min(15, ws.rowCount); r++) {
    const row = ws.getRow(r);
    let score = 0;
    row.eachCell((cell) => {
      const h = text(cellValue(cell.value).value);
      if (h && Object.values(aliases).some((a) => a.includes(norm(h)))) score++;
    });
    if (score >= 2 && (!best || score > best.score)) best = { row: r, score };
  }
  if (!best) return null;

  const headers = new Map<number, string>();
  ws.getRow(best.row).eachCell((cell, col) => {
    const h = text(cellValue(cell.value).value);
    if (h) headers.set(col, h);
  });

  const columns = new Map<string, number>();
  // Exact alias matches first, in alias priority order, so "Amount" beats "Paid".
  for (const [field, list] of Object.entries(aliases)) {
    for (const alias of list) {
      const hit = [...headers.entries()].find(([col, h]) => norm(h) === alias && ![...columns.values()].includes(col));
      if (hit) {
        columns.set(field, hit[0]);
        break;
      }
    }
  }
  const unmapped = [...headers.entries()].filter(([col]) => ![...columns.values()].includes(col)).map(([, h]) => h);

  const rows: Table["rows"] = [];
  for (let r = best.row + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const values = new Map<number, { value: Cell; link: string | null }>();
    row.eachCell({ includeEmpty: false }, (cell, col) => values.set(col, cellValue(cell.value)));
    if (![...values.values()].some((v) => text(v.value))) continue;
    const raw = new Map<string, Cell>();
    for (const [col, h] of headers) raw.set(h, values.get(col)?.value ?? null);
    rows.push({
      row: r,
      get: (f) => {
        const c = columns.get(f);
        return c ? (values.get(c)?.value ?? null) : null;
      },
      link: (f) => {
        const c = columns.get(f);
        return c ? (values.get(c)?.link ?? null) : null;
      },
      raw,
    });
  }
  return { headerRow: best.row, columns, unmapped, rows, headers };
}

function report(ws: ExcelJS.Worksheet | undefined, t: Table | null): SheetReport {
  return {
    sheet: ws?.name ?? null,
    headerRow: t?.headerRow ?? null,
    mapped: t ? Object.fromEntries([...t.columns.entries()].map(([f, c]) => [f, t.headers.get(c) ?? `col ${c}`])) : {},
    unmapped: t?.unmapped ?? [],
    rows: 0,
    skipped: [],
  };
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

export function normTxnStatus(s: string | null): SeedTransaction["status"] {
  const n = norm(s ?? "");
  if (/fail|declin|bounce|past due|overdue/.test(n)) return "failed";
  if (/refund|credit|chargeback/.test(n)) return "refund";
  if (/due|unpaid|pending|open|outstanding|invoice/.test(n)) return "due";
  return "paid";
}

export function normVendorStatus(s: string | null): SeedVendor["status"] {
  const n = norm(s ?? "");
  if (!n) return null;
  if (/fail|declin/.test(n)) return "Failing";
  if (/suspend/.test(n)) return "Suspended";
  if (/pause/.test(n)) return "Paused";
  if (/cancel|ended|closed/.test(n)) return "Cancelled";
  if (/dup/.test(n)) return "Duplicate";
  if (/active|ok|current|live|paid/.test(n)) return "Active";
  return null;
}

export function normCycle(s: string | null, usual: string | null, name = ""): SeedVendor["billing_cycle"] {
  // The vendor name counts too: sheets often say "Canva (annual)" instead of filling a cycle column.
  const n = norm(`${s ?? ""} ${usual ?? ""} ${name}`);
  if (/variable|usage|spend|varies/.test(n)) return "variable";
  if (/annual|year|yr/.test(n)) return "annual";
  if (/quarter/.test(n)) return "quarterly";
  if (/one time|once|one off/.test(n)) return "one-time";
  if (/month|mo\b/.test(n) || s === null) return "monthly";
  return null;
}

export function normPriority(s: string | null): SeedPayable["priority"] {
  const n = norm(s ?? "");
  if (/urgent|asap|now|high|overdue/.test(n)) return "Urgent";
  if (/week|soon|medium/.test(n)) return "This week";
  return "Decide";
}

export function normPayableStatus(s: string | null): SeedPayable["status"] {
  const n = norm(s ?? "");
  if (/disput/.test(n)) return "disputed";
  if (/cancel|void|n a|waived/.test(n)) return "cancelled";
  if (/^paid|done|settled|resolved/.test(n)) return "paid";
  return "open";
}

function billingDay(c: Cell): number | null {
  if (c instanceof Date) return c.getUTCDate();
  const m = /(\d{1,2})/.exec(String(c ?? ""));
  const d = m ? Number(m[1]) : NaN;
  return d >= 1 && d <= 31 ? d : null;
}

function splitPeriod(s: string | null, year?: number): [string | null, string | null] {
  if (!s) return [null, null];
  const parts = s.split(/\s*(?:–|—|-|to)\s*/);
  if (parts.length !== 2) return [null, null];
  return [toDate(parts[0], year), toDate(parts[1], year)];
}

// ---------------------------------------------------------------------------

/** Accepts a file path (scripts) or the uploaded file's bytes (in-app import). */
export async function parseSeedWorkbook(input: string | ArrayBuffer): Promise<SeedData> {
  const wb = new ExcelJS.Workbook();
  if (typeof input === "string") await wb.xlsx.readFile(input);
  else await wb.xlsx.load(input);

  const wsMonthly = findSheet(wb, ["monthly payment", "monthly"]);
  const wsOut = findSheet(wb, ["outstanding", "to pay"]);
  const wsLog = findSheet(wb, ["spend log", "log", "transactions"]);

  const tMonthly = wsMonthly ? readTable(wsMonthly, MONTHLY_COLS) : null;
  const tOut = wsOut ? readTable(wsOut, OUT_COLS) : null;
  const tLog = wsLog ? readTable(wsLog, LOG_COLS) : null;

  const reports = {
    monthly: report(wsMonthly, tMonthly),
    outstanding: report(wsOut, tOut),
    log: report(wsLog, tLog),
  };

  // Monthly Payments → vendor billing details
  const vendors: SeedVendor[] = [];
  for (const r of tMonthly?.rows ?? []) {
    const name = text(r.get("vendor"));
    if (!name || /^total/i.test(name)) {
      if (name) reports.monthly.skipped.push({ row: r.row, reason: "total row" });
      continue;
    }
    const usualText = text(r.get("usual"));
    vendors.push({
      name: name.slice(0, 120),
      channel: text(r.get("channel")),
      brand: text(r.get("brand")),
      billing_cycle: normCycle(text(r.get("cycle")), usualText, name),
      usual_amount_cents: parseMoneyToCents(r.get("usual")),
      billing_day: billingDay(r.get("billing_day")),
      method_last4: last4(text(r.get("card"))),
      status: normVendorStatus(text(r.get("status"))),
      action_note: text(r.get("action")),
      notes: text(r.get("notes")),
    });
    reports.monthly.rows++;
  }

  // Spend Log → transactions
  const transactions: SeedTransaction[] = [];
  const seen = new Map<string, number>();
  for (const r of tLog?.rows ?? []) {
    const vendor = text(r.get("vendor"));
    const date = toDate(r.get("date"));
    const amount = parseMoneyToCents(r.get("amount"));
    if (!vendor || /^total/i.test(vendor)) {
      reports.log.skipped.push({ row: r.row, reason: vendor ? "total row" : "no vendor" });
      continue;
    }
    if (!date) {
      reports.log.skipped.push({ row: r.row, reason: `no valid date (${text(r.get("date")) ?? "empty"})` });
      continue;
    }
    if (amount === null) {
      reports.log.skipped.push({ row: r.row, reason: `no valid amount (${text(r.get("amount")) ?? "empty"})` });
      continue;
    }
    const status = normTxnStatus(text(r.get("status")));
    const ref = text(r.get("invoice_ref"));
    const year = Number(date.slice(0, 4));
    let [ps, pe] = [toDate(r.get("period_start"), year), toDate(r.get("period_end"), year)];
    if (!ps && !pe) [ps, pe] = splitPeriod(text(r.get("period")), year);

    // Identical rows are legitimate (e.g. two equal boosts on one day); number them.
    const base = hash(date, vendor.toLowerCase(), amount, ref, status);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);

    const linkText = r.link("link") ?? text(r.get("link"));
    transactions.push({
      source_id: `seed:spend-log:${base}:${n}`,
      date,
      vendor: vendor.slice(0, 120),
      amount_cents: status === "refund" ? -Math.abs(amount) : amount,
      status,
      invoice_ref: ref,
      description: text(r.get("description")),
      channel: text(r.get("channel")),
      brand: text(r.get("brand")),
      card_last4: last4(text(r.get("card"))),
      period_start: ps,
      period_end: pe,
      gmail_url: linkText && /^https:\/\/mail\.google\.com\//.test(linkText) ? linkText : null,
    });
    reports.log.rows++;
  }

  // Outstanding — To Pay → payables
  const payables: SeedPayable[] = [];
  const seenP = new Map<string, number>();
  for (const r of tOut?.rows ?? []) {
    const vendor = text(r.get("vendor"));
    const description = text(r.get("description")) ?? vendor;
    if (!description || /^total/i.test(description)) {
      reports.outstanding.skipped.push({ row: r.row, reason: description ? "total row" : "no vendor or description" });
      continue;
    }
    const amount = parseMoneyToCents(r.get("amount"));
    const base = hash(vendor?.toLowerCase() ?? null, description.toLowerCase(), amount);
    const n = (seenP.get(base) ?? 0) + 1;
    seenP.set(base, n);
    payables.push({
      source_key: `seed:outstanding:${base}:${n}`,
      vendor: vendor?.slice(0, 120) ?? null,
      description: description.slice(0, 500),
      amount_cents: amount,
      due_date: toDate(r.get("due_date")),
      priority: normPriority(text(r.get("priority"))),
      owner: text(r.get("owner")),
      status: normPayableStatus(text(r.get("status"))),
      next_step: text(r.get("next_step")),
    });
    reports.outstanding.rows++;
  }

  return { vendors, transactions, payables, reports };
}
