import { NextResponse } from "next/server";
import { isCronRequest } from "@/lib/cron";
import { gmailConfigured } from "@/lib/gmail/client";
import { runGmailSync } from "@/lib/gmail/sync";
import { runHealthChecks } from "@/lib/integrations/checks";
import { errorMessage } from "@/lib/redact";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Vercel Cron: health checks for every source, then Gmail receipt sync. */
export async function GET(request: Request) {
  if (!isCronRequest(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const checks = await runHealthChecks();
  const gmailOk = checks.find((c) => c.key === "gmail")?.ok;

  let gmail: unknown = "skipped: not connected";
  if (gmailConfigured() && gmailOk) {
    try {
      gmail = await runGmailSync();
    } catch (e) {
      gmail = { error: errorMessage(e) };
    }
  }
  return NextResponse.json({ checks, gmail });
}
