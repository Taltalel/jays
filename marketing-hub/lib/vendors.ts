import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vendor } from "@/lib/db/types";

/** "Meta Platforms, Inc." → "metaplatforms" */
export function normalizeVendorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\b(inc|llc|ltd|co|corp|corporation|company|limited|pbc)\b\.?/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function matchVendor(vendors: Pick<Vendor, "id" | "name" | "aliases">[], name: string) {
  const n = normalizeVendorName(name);
  if (!n) return null;
  return (
    vendors.find(
      (v) => normalizeVendorName(v.name) === n || (v.aliases ?? []).some((a) => normalizeVendorName(a) === n),
    ) ?? null
  );
}

/**
 * Find a vendor by name or alias, or create it. Works with either the
 * user-scoped or the service-role client.
 */
export async function findOrCreateVendor(
  db: SupabaseClient,
  name: string,
  defaults: { channel?: string | null; brand?: string | null } = {},
): Promise<string> {
  const clean = name.trim().slice(0, 120);
  const { data: vendors, error } = await db.from("vendors").select("id, name, aliases");
  if (error) throw new Error(`vendors lookup failed: ${error.message}`);
  const hit = matchVendor(vendors ?? [], clean);
  if (hit) return hit.id;

  const { data, error: insErr } = await db
    .from("vendors")
    .insert({ name: clean, channel: defaults.channel ?? null, brand: defaults.brand ?? null })
    .select("id")
    .single();
  if (insErr) {
    // Lost a race on the unique name index: read it back.
    const { data: again } = await db.from("vendors").select("id").ilike("name", clean.replace(/[\\%_]/g, (c) => `\\${c}`)).maybeSingle();
    if (again) return again.id;
    throw new Error(`vendor insert failed: ${insErr.message}`);
  }
  return data.id;
}
