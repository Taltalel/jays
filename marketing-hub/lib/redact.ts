/**
 * Guards for sensitive values. Card and bank numbers never get stored —
 * only the last 4 digits — and secrets never reach logs or the database.
 */

/** Keep only the last 4 digits of whatever was given, or null. */
export function last4(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  const digits = String(input).replace(/\D/g, "");
  return digits.length >= 4 ? digits.slice(-4) : null;
}

/**
 * Mask long digit runs (card/bank/account numbers: 9–19 digits, with optional
 * spaces or dashes) down to their last 4. Applied to email text before it is
 * sent to the AI parser, and to any free text before it is stored.
 */
export function maskAccountNumbers(text: string): string {
  return text.replace(/\b(?:\d[ -]?){8,18}\d\b/g, (m) => {
    const d = m.replace(/\D/g, "");
    if (d.length < 9) return m;
    return `••••${d.slice(-4)}`;
  });
}

/** Strip anything token-shaped from an error message before storing it. */
export function redactSecrets(message: string): string {
  return message
    .replace(/(bearer\s+)[\w.\-~+/=]+/gi, "$1[redacted]")
    .replace(/((?:access|refresh|id)_token["'=:\s]+)[\w.\-~+/=]+/gi, "$1[redacted]")
    .replace(/\b(sk-ant-[\w-]+|ya29\.[\w.\-]+|1\/\/[\w.\-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+)/g, "[redacted]")
    .replace(/\b[A-Za-z0-9_\-]{40,}\b/g, "[redacted]")
    .slice(0, 500);
}

export function errorMessage(e: unknown): string {
  return redactSecrets(e instanceof Error ? e.message : String(e));
}
