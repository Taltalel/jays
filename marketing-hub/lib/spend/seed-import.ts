import type { SupabaseClient } from "@supabase/supabase-js";
import { findOrCreateVendor, matchVendor } from "@/lib/vendors";
import type { SeedData } from "./seed-parse";

export interface ImportCounts {
  vendorsCreated: number;
  vendorsUpdated: number;
  transactionsInserted: number;
  payablesInserted: number;
}

/**
 * Idempotent, non-destructive import of the spend spreadsheet.
 *   - transactions are keyed on (source='manual', source_id='seed:spend-log:<hash>:<n>')
 *     and only inserted if missing;
 *   - payables are keyed on source_key and only inserted if missing, so anything
 *     marked Paid/Disputed in the app stays that way;
 *   - vendors are matched by name; only empty fields are filled, except that a
 *     vendor never set up as recurring takes the sheet's cycle and status.
 * Works with the service-role client (script) or the owner's client (in-app).
 */
export async function importSeed(db: SupabaseClient, data: SeedData): Promise<ImportCounts> {
  const { data: run } = await db.from("sync_runs").insert({ source: "seed" }).select("id").single();
  const counts: ImportCounts = { vendorsCreated: 0, vendorsUpdated: 0, transactionsInserted: 0, payablesInserted: 0 };

  try {
    for (const v of data.vendors) {
      const { data: existing, error: listErr } = await db.from("vendors").select("*");
      if (listErr) throw new Error(listErr.message);
      const hit = matchVendor(existing ?? [], v.name);
      if (!hit) {
        const { error } = await db.from("vendors").insert({
          ...v,
          billing_cycle: v.billing_cycle ?? "monthly",
          status: v.status ?? "Active",
        });
        if (error) throw new Error(`vendor ${v.name}: ${error.message}`);
        counts.vendorsCreated++;
        continue;
      }
      const current = (existing ?? []).find((e) => e.id === hit.id)!;
      const unconfigured = current.billing_cycle === "one-time";
      const patch: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) {
        if (k === "name" || val === null) continue;
        if (current[k] === null || (unconfigured && (k === "billing_cycle" || k === "status"))) patch[k] = val;
      }
      if (Object.keys(patch).length) {
        const { error } = await db.from("vendors").update(patch).eq("id", hit.id);
        if (error) throw new Error(`vendor ${v.name}: ${error.message}`);
        counts.vendorsUpdated++;
      }
    }

    for (const t of data.transactions) {
      const vendorId = await findOrCreateVendor(db, t.vendor, { channel: t.channel, brand: t.brand });
      const { vendor: _vendor, ...row } = t;
      void _vendor;
      const { data: ins, error } = await db
        .from("transactions")
        .upsert({ ...row, vendor_id: vendorId, source: "manual" }, { onConflict: "source,source_id", ignoreDuplicates: true })
        .select("id");
      if (error) throw new Error(`transaction ${t.vendor} ${t.date}: ${error.message}`);
      counts.transactionsInserted += ins?.length ?? 0;
    }

    for (const p of data.payables) {
      const vendorId = p.vendor ? await findOrCreateVendor(db, p.vendor) : null;
      const { vendor: _vendor, ...row } = p;
      void _vendor;
      const { data: ins, error } = await db
        .from("payables")
        .upsert({ ...row, vendor_id: vendorId }, { onConflict: "source_key", ignoreDuplicates: true })
        .select("id");
      if (error) throw new Error(`payable ${p.description}: ${error.message}`);
      counts.payablesInserted += ins?.length ?? 0;
    }

    await db
      .from("sync_runs")
      .update({ finished_at: new Date().toISOString(), rows: counts.transactionsInserted + counts.payablesInserted })
      .eq("id", run?.id);
    return counts;
  } catch (e) {
    await db
      .from("sync_runs")
      .update({ finished_at: new Date().toISOString(), error: (e instanceof Error ? e.message : String(e)).slice(0, 500) })
      .eq("id", run?.id);
    throw e;
  }
}
