import { NextResponse, type NextRequest } from "next/server";
import { hasEnv, isAllowedEmail } from "@/lib/env";
import { syncOwners } from "@/lib/owners";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

/** Supabase OAuth return. Signs straight back out anyone not on the allowlist. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));
  if (!code) return to("/login?error=oauth");

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return to("/login?error=oauth");

  if (!isAllowedEmail(data.user.email)) {
    await supabase.auth.signOut();
    return to("/login?error=not_allowed");
  }
  // First sign-in on a fresh database: load the allowlist so RLS lets Tal in.
  if (hasEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    try {
      await syncOwners(supabaseAdmin());
    } catch {
      // Surfaces on Integrations → Supabase; don't block sign-in.
    }
  }
  return to("/");
}
