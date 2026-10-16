import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedEmail } from "@/lib/allowlist";

/**
 * First gate: every request except the sign-in flow and cron endpoints must
 * carry a session for an allowlisted email. Pages, server actions and route
 * handlers check again themselves (requireOwner), and the database checks a
 * third time with RLS — the proxy is not the only lock.
 */
const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cron routes authenticate with CRON_SECRET inside the handler.
  if (pathname.startsWith("/api/cron/")) return NextResponse.next();

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!url || !key) {
    // Not configured yet: only the login page (which explains what's missing) is reachable.
    return isPublic ? response : redirectToLogin(request, "not_configured");
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const allowed = isAllowedEmail(email);

  if (isPublic) return response;
  if (allowed) return response;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return redirectToLogin(request, email ? "not_allowed" : undefined);
}

function redirectToLogin(request: NextRequest, error?: string) {
  const to = request.nextUrl.clone();
  to.pathname = "/login";
  to.search = error ? `?error=${error}` : "";
  return NextResponse.redirect(to);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
