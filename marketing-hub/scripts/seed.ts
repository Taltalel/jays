/**
 * Command-line version of Spend → Import spreadsheet (the in-app page is the
 * normal way; this is for developers).
 *
 *   npm run seed -- --dry-run     # show the column mapping and counts, write nothing
 *   npm run seed                  # import (safe to re-run)
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { formatCents } from "@/lib/money";
import { parseSeedWorkbook, type SheetReport } from "@/lib/spend/seed-parse";
import { importSeed } from "@/lib/spend/seed-import";
import { adminClient } from "./lib";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const fileArg = args.find((a) => !a.startsWith("--"));
const file = resolve(fileArg ?? "seed/Jays-Marketing-Spend-Log.xlsx");

function printReport(name: string, r: SheetReport) {
  console.log(`\n${name}: ${r.sheet ? `sheet "${r.sheet}", header row ${r.headerRow}` : "SHEET NOT FOUND"}`);
  if (!r.sheet) return;
  console.log("  mapped:", Object.entries(r.mapped).map(([f, h]) => `${f} ← "${h}"`).join(", ") || "(none)");
  if (r.unmapped.length) console.log("  ignored columns:", r.unmapped.map((h) => `"${h}"`).join(", "));
  console.log(`  rows: ${r.rows}${r.skipped.length ? `, skipped ${r.skipped.length}` : ""}`);
  for (const s of r.skipped.slice(0, 15)) console.log(`    row ${s.row}: ${s.reason}`);
  if (r.skipped.length > 15) console.log(`    … ${r.skipped.length - 15} more`);
}

async function main() {
  if (!existsSync(file)) {
    console.error(`Seed file not found: ${file}\nPut Jays-Marketing-Spend-Log.xlsx in seed/ (it is gitignored).`);
    process.exit(1);
  }
  const data = await parseSeedWorkbook(file);
  printReport("Monthly Payments", data.reports.monthly);
  printReport("Outstanding — To Pay", data.reports.outstanding);
  printReport("Spend Log", data.reports.log);

  const total = data.transactions.filter((t) => t.status === "paid" || t.status === "refund").reduce((s, t) => s + t.amount_cents, 0);
  console.log(`\nParsed ${data.vendors.length} vendors, ${data.transactions.length} transactions (${formatCents(total)} paid net), ${data.payables.length} payables.`);
  if (dryRun) return console.log("\nDry run — nothing written.");

  const c = await importSeed(adminClient(), data);
  console.log(
    `\nImported: vendors +${c.vendorsCreated} new / ${c.vendorsUpdated} filled in, transactions +${c.transactionsInserted} (of ${data.transactions.length}), payables +${c.payablesInserted} (of ${data.payables.length}).`,
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
