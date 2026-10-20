import type { SupabaseClient } from "@supabase/supabase-js";
import { allowedEmails } from "@/lib/allowlist";

/**
 * Make app_owners (what row-level security checks) match the env allowlist.
 * Needs the service-role client. Runs on sign-in and on every health check,
 * so changing ALLOWED_EMAIL_PRIMARY / BACKUP_ADMIN_EMAIL in Vercel is enough.
 */
export async function syncOwners(admin: SupabaseClient): Promise<string[]> {
  const emails = allowedEmails();
  const { error } = await admin.from("app_owners").upsert(emails.map((email) => ({ email })));
  if (error) throw new Error(`Couldn't update owners (has the database setup SQL been run?): ${error.message}`);
  const { error: delErr } = await admin
    .from("app_owners")
    .delete()
    .not("email", "in", `(${emails.map((e) => `"${e}"`).join(",")})`);
  if (delErr) throw new Error(`Couldn't update owners: ${delErr.message}`);
  return emails;
}
