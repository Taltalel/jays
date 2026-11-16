import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { buildDestination, deviceClass, isBot, isValidCode, referrerHost, WEBSITE_URL } from "@/lib/links/core";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * PUBLIC: the only route guests ever hit. Counts the click (no IP or full
 * user agent stored), then forwards to the link's destination with UTM tags.
 * Unknown or paused codes go to the website, so a typo never shows an error.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code: raw } = await ctx.params;
  const code = raw.toLowerCase();
  const fallback = env("SHORT_LINK_FALLBACK_URL") ?? WEBSITE_URL;

  if (!isValidCode(code)) return redirect(fallback);

  try {
    const db = supabaseAdmin();
    const { data: link } = await db
      .from("tracked_links")
      .select("id, code, utm_source, utm_medium, utm_campaign, utm_content, destination, active")
      .eq("code", code)
      .maybeSingle();
    if (!link || !link.active) return redirect(fallback);

    const ua = request.headers.get("user-agent");
    // Don't let logging failures block the guest.
    await db
      .from("link_clicks")
      .insert({
        link_id: link.id,
        is_bot: isBot(ua),
        device: deviceClass(ua),
        referrer_host: referrerHost(request.headers.get("referer")),
      })
      .then(
        () => undefined,
        () => undefined,
      );

    return redirect(buildDestination(link));
  } catch {
    return redirect(fallback);
  }
}

function redirect(url: string) {
  // 302 + no-store so every visit is counted (no browser or CDN caching).
  return NextResponse.redirect(url, {
    status: 302,
    headers: { "cache-control": "no-store, max-age=0", "referrer-policy": "no-referrer-when-downgrade" },
  });
}
