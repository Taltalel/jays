"use server";
import { redirect } from "next/navigation";
import { allowedEmails, appUrl } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl()}/auth/callback`,
      // Pre-fill the primary account; Google still lets Tal pick the backup.
      queryParams: { login_hint: allowedEmails()[0], prompt: "select_account" },
    },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}
