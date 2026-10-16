/** Money is always integer cents. These helpers are the only place we convert. */

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCents(cents: number | null | undefined, opts?: { whole?: boolean }): string {
  if (cents === null || cents === undefined) return "—";
  return (opts?.whole ? usdWhole : usd).format(cents / 100);
}

/**
 * Parse "$1,234.56", "1234.5", "(12.00)", "-12" or a number into cents.
 * Returns null when the input isn't a money value.
 */
export function parseMoneyToCents(input: unknown): number | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "number") {
    return Number.isFinite(input) ? Math.round(input * 100) : null;
  }
  let s = String(input).trim();
  if (!s) return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/usd/i, "").replace(/[$,\s]/g, "");
  if (s.startsWith("-")) {
    negative = !negative;
    s = s.slice(1);
  }
  const m = /^(\d+)(?:\.(\d{1,2})\d*)?$/.exec(s);
  if (!m) return null;
  const cents = Number(m[1]) * 100 + Number((m[2] ?? "0").padEnd(2, "0"));
  return negative ? -cents : cents;
}
