import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IntegrationRow } from "@/lib/db/types";
import { missingEnv } from "@/lib/env";
import { INTEGRATIONS, type IntegrationDef } from "./registry";

const STALE_MS = 24 * 3600 * 1000;

export type ConnectionState = "connected" | "error" | "not_connected";

export interface IntegrationStatus {
  def: IntegrationDef;
  state: ConnectionState;
  /** Plain-English reason shown next to the badge. */
  reason: string;
  missing: string[];
  lastCheckAt: string | null;
}

/**
 * "Connected" means: required env vars exist AND the last live check passed.
 * Anything else is "Not connected" (or "Error" when a check ran and failed).
 */
export async function getIntegrationStatuses(db: SupabaseClient): Promise<IntegrationStatus[]> {
  const { data } = await db.from("integrations").select("*");
  const rows = new Map(((data ?? []) as IntegrationRow[]).map((r) => [r.key, r]));

  return INTEGRATIONS.map((def) => {
    const missing = missingEnv(def.envVars.filter((v) => !v.optional).map((v) => v.name));
    const row = rows.get(def.key);
    const lastCheckAt = row?.last_check_at ?? null;

    if (def.manual) {
      return { def, state: "not_connected", reason: `Manual source — upload/entry arrives in Phase ${def.phase}.`, missing, lastCheckAt };
    }
    if (missing.length) {
      return { def, state: "not_connected", reason: `Missing env var${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`, missing, lastCheckAt };
    }
    const anySet = def.envVars.some((v) => !missingEnv([v.name]).length);
    if (!def.hasCheck && !anySet) {
      return {
        def,
        state: "not_connected",
        reason: def.envVars.length ? `Not set up yet. Connects in Phase ${def.phase} — see the steps.` : `Arrives in Phase ${def.phase}.`,
        missing,
        lastCheckAt,
      };
    }
    if (!def.hasCheck) {
      return { def, state: "not_connected", reason: `Credentials found. The live check and sync arrive in Phase ${def.phase}.`, missing, lastCheckAt };
    }
    if (!row) {
      return { def, state: "not_connected", reason: "Credentials found but not checked yet. Press “Check now”.", missing, lastCheckAt };
    }
    if (row.status !== "ok") {
      return { def, state: "error", reason: row.last_error ?? "Last check failed.", missing, lastCheckAt };
    }
    if (Date.now() - new Date(row.last_check_at).getTime() > STALE_MS) {
      return { def, state: "not_connected", reason: "Last successful check is over 24h old — cron may not be running. Press “Check now”.", missing, lastCheckAt };
    }
    return { def, state: "connected", reason: "Last live check passed.", missing, lastCheckAt };
  });
}

export async function isConnected(db: SupabaseClient, key: string): Promise<boolean> {
  const all = await getIntegrationStatuses(db);
  return all.find((s) => s.def.key === key)?.state === "connected";
}
