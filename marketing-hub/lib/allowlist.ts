/**
 * The sign-in allowlist. Kept dependency-free so the proxy, server code and
 * scripts all share exactly one definition.
 */
export const PRIMARY_EMAIL_DEFAULT = "marketing@yesfbm.com";

export function allowedEmails(source: Record<string, string | undefined> = process.env): string[] {
  const primary = source.ALLOWED_EMAIL_PRIMARY?.trim() || PRIMARY_EMAIL_DEFAULT;
  const backup = source.BACKUP_ADMIN_EMAIL?.trim();
  return [primary, backup].filter((e): e is string => !!e).map((e) => e.toLowerCase());
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  return !!email && allowedEmails().includes(email.toLowerCase());
}
