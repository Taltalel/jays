import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { RECEIPT_MODEL } from "@/lib/ai/receipt";
import { allowedEmails, env, missingEnv, requireEnv } from "@/lib/env";
import { getProfile } from "@/lib/gmail/client";
import { errorMessage } from "@/lib/redact";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { INTEGRATIONS } from "./registry";

/** Live checks. Each throws with a human-readable reason on failure. */
const CHECKS: Record<string, () => Promise<void>> = {
  async supabase() {
    const db = supabaseAdmin();
    const { data, error } = await db.from("app_owners").select("email");
    if (error) throw new Error(`Database not reachable or migration not run: ${error.message}`);
    const owners = new Set((data ?? []).map((r) => r.email));
    const missing = allowedEmails().filter((e) => !owners.has(e));
    if (missing.length) throw new Error(`Allowlist not loaded into the database (${missing.join(", ")}). Run \`npm run owners\`.`);
  },
  async anthropic() {
    const client = new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
    await client.models.retrieve(RECEIPT_MODEL);
  },
  async gmail() {
    const profile = await getProfile();
    const expected = (env("GMAIL_ACCOUNT") ?? env("ALLOWED_EMAIL_PRIMARY") ?? "marketing@yesfbm.com").toLowerCase();
    if (profile.emailAddress.toLowerCase() !== expected) {
      throw new Error(`Connected to ${profile.emailAddress}, expected ${expected}. Reconnect as ${expected}.`);
    }
  },
};

export interface CheckResult {
  key: string;
  ok: boolean;
  error: string | null;
}

/** Run every implemented check whose env vars are present, and record results. */
export async function runHealthChecks(keys?: string[]): Promise<CheckResult[]> {
  const db = supabaseAdmin();
  const results: CheckResult[] = [];
  for (const def of INTEGRATIONS) {
    if (keys && !keys.includes(def.key)) continue;
    const check = CHECKS[def.key];
    if (!check) continue;
    const required = def.envVars.filter((v) => !v.optional).map((v) => v.name);
    if (missingEnv(required).length) continue;

    let result: CheckResult;
    try {
      await check();
      result = { key: def.key, ok: true, error: null };
    } catch (e) {
      result = { key: def.key, ok: false, error: errorMessage(e) };
    }
    results.push(result);
    if (def.key === "supabase" && !result.ok && /not reachable/.test(result.error ?? "")) continue;
    await db.from("integrations").upsert({
      key: def.key,
      status: result.ok ? "ok" : "error",
      last_check_at: new Date().toISOString(),
      last_error: result.error,
    });
  }
  return results;
}
