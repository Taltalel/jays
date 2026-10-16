import "server-only";

/**
 * Server-side env access. Values are read lazily so a missing optional
 * integration never breaks the build — it just shows "Not connected".
 * Never log the values returned from here.
 */
export function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export function requireEnv(name: string): string {
  const v = env(name);
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export function hasEnv(...names: string[]): boolean {
  return names.every((n) => env(n) !== undefined);
}

export function missingEnv(names: string[]): string[] {
  return names.filter((n) => env(n) === undefined);
}

export { allowedEmails, isAllowedEmail } from "@/lib/allowlist";

export function appUrl(): string {
  const explicit = env("APP_URL");
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = env("VERCEL_PROJECT_PRODUCTION_URL");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
