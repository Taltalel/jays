/**
 * Idempotent, non-destructive import of seed/Jays-Marketing-Spend-Log.xlsx.
 *
 *   npm run seed -- --dry-run     # show the column mapping and counts, write nothing
 *   npm run seed                  # import
 *
 * Re-running is safe:
 *   - transactions are keyed on (source='manual', source_id='seed:spend-log:<hash>:<n>')
 *     and only inserted if missing;
 *   - payables are keyed on source_key and only inserted if missing, so
 *     anything marked Paid/Disputed in the app stays that way;
 *   - vendors are matched by name; existing values are kept and only empty
 *     fields are filled from the Monthly Payments sheet.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { formatCents } from "@/lib/money";
import { findOrCreateVendor, matchVendor } from "@/lib/vendors";
import { adminClient } from "./lib";
import { parseSeedWorkbook, type SheetReport } from "./seed-parse";

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

  if (dryRun) {
    console.log("\nDry run — nothing written.");
    return;
  }

  const db = adminClient();
  const { data: run } = await db.from("sync_runs").insert({ source: "seed" }).select("id").single();

  try {
    // 1. Vendors from Monthly Payments: fill empty fields only.
    let vendorsCreated = 0;
    let vendorsUpdated = 0;
    for (const v of data.vendors) {
      const { data: existing } = await db.from("vendors").select("*");
      const hit = matchVendor(existing ?? [], v.name);
      if (!hit) {
        const { error } = await db.from("vendors").insert({
          ...v,
          billing_cycle: v.billing_cycle ?? "monthly",
          status: v.status ?? "Active",
        });
        if (error) throw new Error(`vendor ${v.name}: ${error.message}`);
        vendorsCreated++;
        continue;
      }
      const current = (existing ?? []).find((e) => e.id === hit.id)!;
      const patch: Record<string, unknown> = {};
      // A vendor still on the 'one-time' default has never been set up as a
      // recurring payment (it was created from a receipt), so the sheet's
      // cycle and status apply. Otherwise only empty fields are filled, so
      // edits made in the app survive a re-run.
      const unconfigured = current.billing_cycle === "one-time";
      for (const [k, val] of Object.entries(v)) {
        if (k === "name" || val === null) continue;
        if (current[k] === null || (unconfigured && (k === "billing_cycle" || k === "status"))) patch[k] = val;
      }
      if (Object.keys(patch).length) {
        const { error } = await db.from("vendors").update(patch).eq("id", hit.id);
        if (error) throw new Error(`vendor ${v.name}: ${error.message}`);
        vendorsUpdated++;
      }
    }

    // 2. Transactions from Spend Log.
    let txnsInserted = 0;
    for (const t of data.transactions) {
      const vendorId = await findOrCreateVendor(db, t.vendor, { channel: t.channel, brand: t.brand });
      const { vendor: _vendor, ...row } = t;
      void _vendor;
      const { data: ins, error } = await db
        .from("transactions")
        .upsert({ ...row, vendor_id: vendorId, source: "manual" }, { onConflict: "source,source_id", ignoreDuplicates: true })
        .select("id");
      if (error) throw new Error(`transaction ${t.vendor} ${t.date}: ${error.message}`);
      txnsInserted += ins?.length ?? 0;
    }

    // 3. Payables from Outstanding — To Pay.
    let payablesInserted = 0;
    for (const p of data.payables) {
      const vendorId = p.vendor ? await findOrCreateVendor(db, p.vendor) : null;
      const { vendor: _vendor, ...row } = p;
      void _vendor;
      const { data: ins, error } = await db
        .from("payables")
        .upsert({ ...row, vendor_id: vendorId }, { onConflict: "source_key", ignoreDuplicates: true })
        .select("id");
      if (error) throw new Error(`payable ${p.description}: ${error.message}`);
      payablesInserted += ins?.length ?? 0;
    }

    await db
      .from("sync_runs")
      .update({ finished_at: new Date().toISOString(), rows: txnsInserted + payablesInserted })
      .eq("id", run?.id);

    console.log(
      `\nImported: vendors +${vendorsCreated} new / ${vendorsUpdated} filled in, transactions +${txnsInserted} (of ${data.transactions.length}), payables +${payablesInserted} (of ${data.payables.length}).`,
    );
  } catch (e) {
    await db
      .from("sync_runs")
      .update({ finished_at: new Date().toISOString(), error: e instanceof Error ? e.message : String(e) })
      .eq("id", run?.id);
    throw e;
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
