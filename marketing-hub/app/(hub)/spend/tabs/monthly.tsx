import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Badge, buttonClass, Empty } from "@/components/ui";
import { BILLING_CYCLES, BRANDS, CHANNELS, VENDOR_STATUSES } from "@/lib/db/types";
import { formatCents } from "@/lib/money";
import { getVendors, paidByVendorMonth } from "@/lib/spend/queries";
import { nyDate } from "@/lib/time";
import { vendorStatusTone } from "@/lib/ui-tones";
import { updateVendor } from "../actions";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function MonthlyTab({ db, year: yearParam }: { db: SupabaseClient; year?: string }) {
  const thisYear = Number(nyDate().slice(0, 4));
  const year = yearParam && /^\d{4}$/.test(yearParam) ? Number(yearParam) : thisYear;

  const [vendors, paid] = await Promise.all([
    getVendors(db),
    paidByVendorMonth(db, `${year}-01-01`, `${year + 1}-01-01`),
  ]);
  const recurring = vendors.filter((v) => v.billing_cycle !== "one-time" || v.usual_amount_cents !== null);
  const months = MONTHS.map((label, i) => ({ label, key: `${year}-${String(i + 1).padStart(2, "0")}-01` }));

  if (!recurring.length) {
    return (
      <Empty
        title="No subscriptions, retainers or ad accounts yet"
        reason="This tab fills from the Monthly Payments sheet in seed/Jays-Marketing-Spend-Log.xlsx (run `npm run seed`), or from any vendor you mark monthly, annual or variable."
      />
    );
  }

  const totalByMonth = months.map((m) => recurring.reduce((s, v) => s + (paid.get(v.id)?.get(m.key) ?? 0), 0));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <div className="text-muted">
          Paid columns are real transactions (Spend Log), not usual amounts. Meta and Google Ads are variable rows.
        </div>
        <div className="flex gap-2">
          <Link className="text-muted hover:text-fg" href={`/spend?tab=monthly&year=${year - 1}`}>
            ← {year - 1}
          </Link>
          <span className="font-medium">{year}</span>
          {year < thisYear && (
            <Link className="text-muted hover:text-fg" href={`/spend?tab=monthly&year=${year + 1}`}>
              {year + 1} →
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="tabular w-full min-w-[1200px] text-sm">
          <thead className="bg-panel text-left text-xs text-muted">
            <tr>
              <th className="sticky left-0 bg-panel px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Usual</th>
              <th className="px-3 py-2">Bills on</th>
              <th className="px-3 py-2">Card</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action note</th>
              {months.map((m) => (
                <th key={m.key} className="px-2 py-2 text-right">
                  {m.label}
                </th>
              ))}
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {recurring.map((v) => {
              const row = paid.get(v.id);
              const total = months.reduce((s, m) => s + (row?.get(m.key) ?? 0), 0);
              return (
                <tr key={v.id} className="border-t border-line align-top">
                  <td className="sticky left-0 bg-bg px-3 py-2">
                    <details>
                      <summary className="cursor-pointer list-none">
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-dim">
                          {v.channel ?? "No channel"} · {v.billing_cycle}
                        </div>
                      </summary>
                      <VendorForm vendor={v} />
                    </details>
                  </td>
                  <td className="px-3 py-2">
                    {v.billing_cycle === "variable" ? <span className="text-muted">Variable</span> : formatCents(v.usual_amount_cents)}
                  </td>
                  <td className="px-3 py-2">{v.billing_day ? `Day ${v.billing_day}` : "—"}</td>
                  <td className="px-3 py-2">{v.method_last4 ? `••${v.method_last4}` : "—"}</td>
                  <td className="px-3 py-2">
                    <Badge tone={vendorStatusTone(v.status)}>{v.status}</Badge>
                  </td>
                  <td className="max-w-[220px] px-3 py-2 text-xs text-muted">{v.action_note ?? ""}</td>
                  {months.map((m) => {
                    const c = row?.get(m.key);
                    return (
                      <td key={m.key} className="px-2 py-2 text-right">
                        {c ? formatCents(c, { whole: true }) : <span className="text-dim">·</span>}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right font-medium">{formatCents(total, { whole: true })}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-line bg-panel text-xs">
            <tr>
              <td className="sticky left-0 bg-panel px-3 py-2 font-medium" colSpan={6}>
                Total paid
              </td>
              {totalByMonth.map((t, i) => (
                <td key={i} className="px-2 py-2 text-right">
                  {t ? formatCents(t, { whole: true }) : ""}
                </td>
              ))}
              <td className="px-3 py-2 text-right font-semibold">
                {formatCents(totalByMonth.reduce((a, b) => a + b, 0), { whole: true })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-xs text-dim">Source: Spend Log transactions (Gmail, uploads, manual, spreadsheet). Tap a vendor to edit its billing details.</p>
    </div>
  );
}

function VendorForm({ vendor: v }: { vendor: Awaited<ReturnType<typeof getVendors>>[number] }) {
  return (
    <form action={updateVendor} className="mt-3 grid w-72 gap-2 rounded-lg border border-line bg-panel p-3">
      <input type="hidden" name="id" value={v.id} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label>Status</label>
          <select name="status" defaultValue={v.status}>
            {VENDOR_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Cycle</label>
          <select name="billing_cycle" defaultValue={v.billing_cycle}>
            {BILLING_CYCLES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Usual amount</label>
          <input name="usual_amount" inputMode="decimal" defaultValue={v.usual_amount_cents !== null ? (v.usual_amount_cents / 100).toFixed(2) : ""} />
        </div>
        <div>
          <label>Billing day</label>
          <input name="billing_day" inputMode="numeric" defaultValue={v.billing_day ?? ""} />
        </div>
        <div>
          <label>Card last 4</label>
          <input name="method_last4" inputMode="numeric" maxLength={4} defaultValue={v.method_last4 ?? ""} />
        </div>
        <div>
          <label>Brand</label>
          <select name="brand" defaultValue={v.brand ?? ""}>
            <option value="">—</option>
            {BRANDS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label>Channel</label>
        <select name="channel" defaultValue={v.channel ?? ""}>
          <option value="">—</option>
          {CHANNELS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Action note</label>
        <input name="action_note" defaultValue={v.action_note ?? ""} />
      </div>
      <button className={buttonClass("primary")}>Save</button>
    </form>
  );
}
