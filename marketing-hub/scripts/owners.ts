/**
 * Sync the sign-in allowlist (ALLOWED_EMAIL_PRIMARY + BACKUP_ADMIN_EMAIL)
 * into app_owners, which RLS checks. Run after changing either env var:
 *   npm run owners
 */
import { allowedEmails } from "@/lib/allowlist";
import { adminClient } from "./lib";

async function main() {
  const db = adminClient();
  const emails = allowedEmails();
  const { error } = await db.from("app_owners").upsert(emails.map((email) => ({ email })));
  if (error) throw new Error(error.message);
  const { error: delErr } = await db
    .from("app_owners")
    .delete()
    .not("email", "in", `(${emails.map((e) => `"${e}"`).join(",")})`);
  if (delErr) throw new Error(delErr.message);
  console.log(`Owners: ${emails.join(", ")}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
