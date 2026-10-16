import "server-only";
import { redirect } from "next/navigation";
import { isAllowedEmail } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Second gate (after the proxy). Call at the top of every page, server action
 * and route handler. Verifies the session with Supabase Auth, then checks the
 * allowlist. Returns a user-scoped (RLS) client.
 */
export async function requireOwner(opts?: { onFail?: "redirect" | "throw" }) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  const email = data.user?.email ?? null;
  if (error || !data.user || !isAllowedEmail(email)) {
    if (opts?.onFail === "throw") throw new Error("Not authorized");
    redirect(email ? "/login?error=not_allowed" : "/login");
  }
  return { supabase, email: email as string };
}
