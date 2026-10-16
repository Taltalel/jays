import "server-only";
import { env, requireEnv } from "@/lib/env";

/**
 * Minimal read-only Gmail API client (scope: gmail.readonly).
 * The refresh token lives only in the GMAIL_REFRESH_TOKEN env var.
 * Tokens are never logged or stored.
 */
export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const API = "https://gmail.googleapis.com/gmail/v1/users/me";

let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      refresh_token: requireEnv("GMAIL_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !body.access_token) {
    // Only Google's error code/description — never the request or response tokens.
    throw new Error(`Gmail token refresh failed: ${body.error ?? res.status} ${body.error_description ?? ""}`.trim());
  }
  cached = { token: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return cached.token;
}

async function gmail<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { authorization: `Bearer ${await accessToken()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(`Gmail API ${res.status}: ${body.error?.message ?? res.statusText}`);
  }
  return (await res.json()) as T;
}

export function gmailConfigured(): boolean {
  return !!(env("GOOGLE_OAUTH_CLIENT_ID") && env("GOOGLE_OAUTH_CLIENT_SECRET") && env("GMAIL_REFRESH_TOKEN"));
}

export async function getProfile() {
  return gmail<{ emailAddress: string; messagesTotal: number }>("/profile");
}

export async function listMessageIds(q: string, max: number): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  while (ids.length < max) {
    const params = new URLSearchParams({ q, maxResults: String(Math.min(100, max - ids.length)) });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await gmail<{ messages?: { id: string }[]; nextPageToken?: string }>(`/messages?${params}`);
    ids.push(...(page.messages ?? []).map((m) => m.id));
    if (!page.nextPageToken) break;
    pageToken = page.nextPageToken;
  }
  return ids;
}

interface Part {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string; attachmentId?: string; size?: number };
  parts?: Part[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  internalDate: string;
  payload: Part;
}

export async function getMessage(id: string): Promise<GmailMessage> {
  return gmail<GmailMessage>(`/messages/${encodeURIComponent(id)}?format=full`);
}

export async function getAttachment(messageId: string, attachmentId: string): Promise<string> {
  const a = await gmail<{ data: string }>(
    `/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}`,
  );
  return base64UrlToBase64(a.data);
}

export function header(msg: GmailMessage, name: string): string {
  return msg.payload.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function base64UrlToBase64(s: string): string {
  return s.replace(/-/g, "+").replace(/_/g, "/");
}

function decode(data?: string): string {
  return data ? Buffer.from(base64UrlToBase64(data), "base64").toString("utf8") : "";
}

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function walk(part: Part, out: Part[] = []): Part[] {
  out.push(part);
  for (const p of part.parts ?? []) walk(p, out);
  return out;
}

/** Plain text of the message (text/plain preferred, else stripped HTML). */
export function messageText(msg: GmailMessage): string {
  const parts = walk(msg.payload);
  const plain = parts.filter((p) => p.mimeType === "text/plain" && !p.filename).map((p) => decode(p.body?.data));
  if (plain.join("").trim()) return plain.join("\n");
  return parts
    .filter((p) => p.mimeType === "text/html" && !p.filename)
    .map((p) => htmlToText(decode(p.body?.data)))
    .join("\n");
}

export function pdfAttachments(msg: GmailMessage): { attachmentId: string; filename: string; size: number }[] {
  return walk(msg.payload)
    .filter(
      (p) =>
        p.body?.attachmentId &&
        (p.mimeType === "application/pdf" || p.filename?.toLowerCase().endsWith(".pdf")),
    )
    .map((p) => ({ attachmentId: p.body!.attachmentId!, filename: p.filename ?? "attachment.pdf", size: p.body?.size ?? 0 }));
}

export function gmailWebUrl(messageId: string): string {
  const account = env("GMAIL_ACCOUNT") ?? env("ALLOWED_EMAIL_PRIMARY") ?? "marketing@yesfbm.com";
  return `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(account)}#all/${messageId}`;
}

/** OAuth consent URL for the one-time "Connect Gmail" flow. */
export function gmailConsentUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: `openid email ${GMAIL_SCOPE}`,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "false",
    login_hint: env("GMAIL_ACCOUNT") ?? env("ALLOWED_EMAIL_PRIMARY") ?? "marketing@yesfbm.com",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCode(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as {
    refresh_token?: string;
    access_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok) throw new Error(`Google token exchange failed: ${body.error ?? res.status} ${body.error_description ?? ""}`.trim());
  return body;
}
