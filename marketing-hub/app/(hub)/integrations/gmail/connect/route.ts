import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { appUrl, hasEnv } from "@/lib/env";
import { gmailConsentUrl } from "@/lib/gmail/client";

/** Starts the one-time Gmail (read-only) consent flow. */
export async function GET() {
  await requireOwner({ onFail: "throw" });
  if (!hasEnv("GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET")) {
    return NextResponse.redirect(`${appUrl()}/integrations?error=Set+GOOGLE_OAUTH_CLIENT_ID+and+GOOGLE_OAUTH_CLIENT_SECRET+first`);
  }
  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(gmailConsentUrl(`${appUrl()}/integrations/gmail/callback`, state));
  res.cookies.set("gmail_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/integrations/gmail",
    maxAge: 600,
  });
  return res;
}
