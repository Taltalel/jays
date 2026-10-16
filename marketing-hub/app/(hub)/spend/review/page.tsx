import Link from "next/link";
import { Badge, buttonClass, Empty, Notice, PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { BRANDS, CHANNELS, effectiveChannel, TXN_STATUSES } from "@/lib/db/types";
import { getReviewQueue } from "@/lib/spend/queries";
import { formatDate } from "@/lib/time";
import { SOURCE_LABEL } from "@/lib/ui-tones";
import { approveTransaction, rejectTransaction } from "../actions";

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { supabase } = await requireOwner();
  const sp = await searchParams;
  const queue = await getReviewQueue(supabase);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Needs review"
        subtitle={
          <>
            <Link href="/spend" className="hover:text-fg">
              ← Spend
            </Link>{" "}
            · AI extractions with low confidence or missing fields. Not counted in any total until you approve them.
          </>
        }
      />
      {sp.error && <Notice tone="bad">{sp.error}</Notice>}
      {sp.ok && <Notice tone="ok">{sp.ok}</Notice>}

      {queue.length === 0 ? (
        <Empty title="Queue is empty" reason="Every parsed receipt has been booked or dismissed. New low-confidence ones from Gmail or uploads land here." />
      ) : (
        <div className="grid gap-4">
          {queue.map((t) => (
            <div key={t.id} className="rounded-xl border border-line bg-panel p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="warn">AI {t.parsed_confidence !== null ? `${Math.round(t.parsed_confidence * 100)}%` : "?"}</Badge>
                  <span className="text-muted">{SOURCE_LABEL[t.source]}</span>
                  {t.gmail_url && (
                    <a href={t.gmail_url} target="_blank" rel="noreferrer" className="text-info underline">
                      Open email ↗
                    </a>
                  )}
                  <span className="text-dim">found {formatDate(t.date)}</span>
                </div>
              </div>
              {t.review_note && <div className="mb-3 text-sm text-warn">{t.review_note}</div>}

              <form action={approveTransaction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input type="hidden" name="id" value={t.id} />
                <div>
                  <label>Vendor *</label>
                  <input name="vendor" defaultValue={t.vendors?.name ?? ""} required />
                </div>
                <div>
                  <label>Amount *</label>
                  <input name="amount" inputMode="decimal" defaultValue={t.amount_cents ? (Math.abs(t.amount_cents) / 100).toFixed(2) : ""} required />
                </div>
                <div>
                  <label>Date *</label>
                  <input name="date" type="date" defaultValue={t.date} required />
                </div>
                <div>
                  <label>Status</label>
                  <select name="status" defaultValue={t.status}>
                    {TXN_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Channel</label>
                  <select name="channel" defaultValue={t.channel ?? effectiveChannel(t)}>
                    {CHANNELS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Brand</label>
                  <select name="brand" defaultValue={t.brand ?? ""}>
                    <option value="">—</option>
                    {BRANDS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Invoice / ref</label>
                  <input name="invoice_ref" defaultValue={t.invoice_ref ?? ""} />
                </div>
                <div>
                  <label>Card last 4</label>
                  <input name="card_last4" maxLength={4} inputMode="numeric" defaultValue={t.card_last4 ?? ""} />
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <label>Description</label>
                  <input name="description" defaultValue={t.description ?? ""} />
                </div>
                <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-4">
                  <button formAction={rejectTransaction} className={buttonClass("danger")} formNoValidate>
                    Not a receipt — dismiss
                  </button>
                  <button className={buttonClass("primary")}>Approve &amp; book</button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
