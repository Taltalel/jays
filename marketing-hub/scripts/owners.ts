/**
 * Sync the sign-in allowlist into app_owners. The app also does this on every
 * sign-in and health check, so this is only for developers.
 *   npm run owners
 */
import { syncOwners } from "@/lib/owners";
import { adminClient } from "./lib";

syncOwners(adminClient())
  .then((emails) => console.log(`Owners: ${emails.join(", ")}`))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
