import { timingSafeEqual } from "node:crypto";
import { type NextRequest } from "next/server";
import { requireOwner } from "@/lib/auth";
import { appUrl, env } from "@/lib/env";
import { exchangeCode, GMAIL_SCOPE } from "@/lib/gmail/client";
import { errorMessage } from "@/lib/redact";

/**
 * Google returns here after consent. The refresh token is shown ONCE so Tal
 * can paste it into Vercel as GMAIL_REFRESH_TOKEN. It is never stored or logged.
 */
export async function GET(request: NextRequest) {
  await requireOwner({ onFail: "throw" });
  const q = request.nextUrl.searchParams;
  const cookie = request.cookies.get("gmail_oauth_state")?.value ?? "";
  const state = q.get("state") ?? "";

  const fail = (msg: string) => page("Gmail not connected", `<p class="bad">${esc(msg)}</p>`);

  if (q.get("error")) return fail(`Google returned: ${q.get("error")}`);
  if (!cookie || cookie.length !== state.length || !timingSafeEqual(Buffer.from(cookie), Buffer.from(state))) {
    return fail("This link expired or didn't start from the Hub. Start again from Integrations.");
  }
  const code = q.get("code");
  if (!code) return fail("No authorization code returned.");

  try {
    const tokens = await exchangeCode(code, `${appUrl()}/integrations/gmail/callback`);
    if (!tokens.scope?.split(" ").includes(GMAIL_SCOPE)) return fail("The gmail.readonly permission wasn't granted. Try again and allow it.");
    if (tokens.scope.split(" ").some((s) => s.includes("gmail") && s !== GMAIL_SCOPE)) {
      return fail("Google granted extra Gmail permissions. The Hub only accepts gmail.readonly. Revoke access at myaccount.google.com/permissions and reconnect.");
    }
    if (!tokens.refresh_token) {
      return fail("Google didn't return a refresh token. Remove the Hub at myaccount.google.com/permissions, then connect again.");
    }

    const profileRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    const profile = (await profileRes.json().catch(() => ({}))) as { emailAddress?: string };
    const expected = (env("GMAIL_ACCOUNT") ?? env("ALLOWED_EMAIL_PRIMARY") ?? "marketing@yesfbm.com").toLowerCase();
    if (profile.emailAddress?.toLowerCase() !== expected) {
      return fail(`You approved as ${profile.emailAddress ?? "an unknown account"}. Connect as ${expected}.`);
    }

    const res = page(
      "Gmail connected — one more step",
      `<p>Approved as <b>${esc(profile.emailAddress!)}</b> with <code>gmail.readonly</code> only.</p>
       <ol>
         <li>Copy the token below.</li>
         <li>Vercel → this project → Settings → Environment Variables → add <code>GMAIL_REFRESH_TOKEN</code> (Production) and paste it.</li>
         <li>Redeploy, then press “Check now” on Integrations.</li>
       </ol>
       <textarea readonly rows="4" onclick="this.select()">${esc(tokens.refresh_token)}</textarea>
       <p class="dim">This page is the only time the token is shown. The Hub does not store it. Close this tab when done.</p>`,
    );
    res.headers.append("set-cookie", "gmail_oauth_state=; Path=/integrations/gmail; Max-Age=0; HttpOnly; SameSite=Lax");
    return res;
  } catch (e) {
    return fail(errorMessage(e));
  }
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function page(title: string, body: string) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>body{background:#0b0b0c;color:#ededed;font:15px/1.5 system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 16px}
textarea{width:100%;background:#1b1b1e;color:#ededed;border:1px solid #26262a;border-radius:8px;padding:8px;font:13px ui-monospace,monospace}
code{background:#1b1b1e;padding:1px 4px;border-radius:4px}.bad{color:#f87171}.dim{color:#6b6b73;font-size:13px}a{color:#93c5fd}</style></head>
<body><h1 style="font-size:20px">${esc(title)}</h1>${body}<p><a href="/integrations">← Back to Integrations</a></p></body></html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, max-age=0",
        "referrer-policy": "no-referrer",
        "x-frame-options": "DENY",
      },
    },
  );
}
