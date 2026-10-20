import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Badge, buttonClass, Card, Empty } from "@/components/ui";
import { BRANDS, CHANNELS, effectiveBrand, effectiveChannel, TXN_STATUSES } from "@/lib/db/types";
import { formatCents } from "@/lib/money";
import { getTransactions, getVendors, sumSpend } from "@/lib/spend/queries";
import { formatDate, nyDate } from "@/lib/time";
import { SOURCE_LABEL, txnStatusTone } from "@/lib/ui-tones";
import { addExpense } from "../actions";

type SP = Record<string, string | undefined>;

export async function LogTab({ db, sp }: { db: SupabaseClient; sp: SP }) {
  const filters = {
    month: sp.month,
    vendor: sp.vendor,
    channel: sp.channel,
    brand: sp.brand,
    status: sp.status,
    source: sp.source,
  };
  const [rows, vendors] = await Promise.all([getTransactions(db, filters), getVendors(db)]);
  const filtered = Object.values(filters).some(Boolean);

  return (
    <div className="grid grid-cols-1 gap-5">
      <form className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-panel p-3 sm:grid-cols-3 lg:grid-cols-7 [&>*]:min-w-0">
        <input type="hidden" name="tab" value="log" />
        <div>
          <label>Month</label>
          <input type="month" name="month" defaultValue={sp.month ?? ""} />
        </div>
        <div>
          <label>Vendor</label>
          <select name="vendor" defaultValue={sp.vendor ?? ""}>
            <option value="">All</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Channel</label>
          <select name="channel" defaultValue={sp.channel ?? ""}>
            <option value="">All</option>
            {CHANNELS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Brand</label>
          <select name="brand" defaultValue={sp.brand ?? ""}>
            <option value="">All</option>
            {BRANDS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Status</label>
          <select name="status" defaultValue={sp.status ?? ""}>
            <option value="">All</option>
            {TXN_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Source</label>
          <select name="source" defaultValue={sp.source ?? ""}>
            <option value="">All</option>
            {Object.entries(SOURCE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button className={buttonClass("primary")}>Filter</button>
          {filtered && (
            <Link href="/spend?tab=log" className="pb-2 text-sm text-muted hover:text-fg">
              Clear
            </Link>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        <Empty
          title={filtered ? "No transactions match these filters" : "No transactions yet"}
          reason={
            filtered
              ? "Try clearing a filter. Receipts in “Needs review” are not shown here until approved."
              : "Transactions arrive from the Spend Log sheet (Import spreadsheet), Gmail sync, uploads and “Add expense”. None have been loaded yet."
          }
        />
      ) : (
        <div>
          <div className="mb-2 text-sm text-muted">
            {rows.length} transactions · spent {formatCents(sumSpend(rows))} (paid minus refunds; due and failed not counted)
          </div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="tabular w-full min-w-[860px] text-sm">
              <thead className="bg-panel text-left text-xs text-muted">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Vendor</th>
                  <th className="px-3 py-2">Channel · Brand</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Ref · Card</th>
                  <th className="px-3 py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-t border-line align-top">
                    <td className="whitespace-nowrap px-3 py-2">{formatDate(t.date)}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{t.vendors?.name ?? "—"}</div>
                      {t.description && <div className="max-w-[260px] text-xs text-dim">{t.description}</div>}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted">
                      {effectiveChannel(t)} · {effectiveBrand(t)}
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={txnStatusTone(t.status)}>{t.status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{formatCents(t.amount_cents)}</td>
                    <td className="px-3 py-2 text-xs text-muted">
                      {t.invoice_ref ?? "—"}
                      {t.card_last4 && ` · ••${t.card_last4}`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      {t.gmail_url ? (
                        <a href={t.gmail_url} target="_blank" rel="noreferrer" className="text-info underline">
                          Gmail ↗
                        </a>
                      ) : t.source_id.startsWith("seed:") ? (
                        <span className="text-muted">Spreadsheet</span>
                      ) : (
                        <span className="text-muted">{SOURCE_LABEL[t.source]}</span>
                      )}
                      {t.parsed_confidence !== null && (
                        <div className="text-dim">AI {Math.round(t.parsed_confidence * 100)}%</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div id="add">
        <Card title="Add expense">
          <form action={addExpense} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            <div className="sm:col-span-2">
              <label>Vendor *</label>
              <input name="vendor" list="vendor-names" required />
              <datalist id="vendor-names">
                {vendors.map((v) => (
                  <option key={v.id} value={v.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label>Date *</label>
              <input name="date" type="date" defaultValue={nyDate()} required />
            </div>
            <div>
              <label>Amount (USD) *</label>
              <input name="amount" inputMode="decimal" placeholder="0.00" required />
            </div>
            <div>
              <label>Status</label>
              <select name="status" defaultValue="paid">
                {TXN_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Channel</label>
              <select name="channel" defaultValue="">
                <option value="">Use vendor&apos;s</option>
                {CHANNELS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Brand</label>
              <select name="brand" defaultValue="">
                <option value="">Use vendor&apos;s</option>
                {BRANDS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Card last 4</label>
              <input name="card_last4" inputMode="numeric" maxLength={4} />
            </div>
            <div>
              <label>Invoice / ref</label>
              <input name="invoice_ref" />
            </div>
            <div>
              <label>Period start</label>
              <input name="period_start" type="date" />
            </div>
            <div>
              <label>Period end</label>
              <input name="period_end" type="date" />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label>Description</label>
              <input name="description" />
            </div>
            <div className="flex items-end justify-between gap-3 sm:col-span-2 lg:col-span-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="allow_duplicate" className="w-auto" /> Save anyway if it looks like a duplicate
              </label>
              <button className={buttonClass("primary")}>Add expense</button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
