import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Badge, buttonClass, Card, Empty } from "@/components/ui";
import { PAYABLE_PRIORITIES, type Payable } from "@/lib/db/types";
import { formatCents } from "@/lib/money";
import { getPayables } from "@/lib/spend/queries";
import { daysBetween, formatDate, nyDate } from "@/lib/time";
import { priorityTone } from "@/lib/ui-tones";
import { addPayable, resolvePayable } from "../actions";

const PRIORITY_ORDER: Record<string, number> = { Urgent: 0, "This week": 1, Decide: 2 };

export async function OutstandingTab({ db, show }: { db: SupabaseClient; show?: string }) {
  const all = await getPayables(db);
  const today = nyDate();
  const showResolved = show === "all";
  const open = all
    .filter((p) => p.status === "open" || p.status === "disputed")
    .sort(
      (a, b) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"),
    );
  const resolved = all.filter((p) => p.status === "paid" || p.status === "cancelled");
  const openTotal = open.filter((p) => p.status === "open").reduce((s, p) => s + (p.amount_cents ?? 0), 0);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <div className="text-muted">
            {open.length} open · {formatCents(openTotal)} known amounts
          </div>
          <Link className="text-muted hover:text-fg" href={showResolved ? "/spend?tab=outstanding" : "/spend?tab=outstanding&show=all"}>
            {showResolved ? "Hide resolved" : `Show resolved (${resolved.length})`}
          </Link>
        </div>

        {open.length === 0 ? (
          <Empty
            title="Nothing outstanding"
            reason={
              all.length
                ? "Every payable is paid, disputed-and-closed or cancelled."
                : "No payables yet. They load from the “Outstanding — To Pay” sheet (Spend → Import spreadsheet), or add one on the right."
            }
          />
        ) : (
          <div className="grid gap-3">
            {open.map((p) => (
              <PayableCard key={p.id} p={p} today={today} />
            ))}
          </div>
        )}

        {showResolved && resolved.length > 0 && (
          <div className="mt-6 grid gap-2">
            <div className="text-xs uppercase tracking-wide text-dim">Resolved</div>
            {resolved.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                <div>
                  <span className="font-medium">{p.vendors?.name ?? "—"}</span> · {p.description}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Badge tone={p.status === "paid" ? "ok" : "muted"}>{p.status}</Badge>
                  {formatDate(p.resolved_at)} {p.resolved_ref && `· ${p.resolved_ref}`}
                  <form action={resolvePayable}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="action" value="reopen" />
                    <button className="underline hover:text-fg">Reopen</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Card title="Add to pay">
        <form action={addPayable} className="grid gap-3">
          <div>
            <label>Vendor</label>
            <input name="vendor" />
          </div>
          <div>
            <label>What is it *</label>
            <input name="description" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label>Amount</label>
              <input name="amount" inputMode="decimal" placeholder="0.00" />
            </div>
            <div>
              <label>Due</label>
              <input name="due_date" type="date" />
            </div>
            <div>
              <label>Priority</label>
              <select name="priority" defaultValue="This week">
                {PAYABLE_PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Owner</label>
              <input name="owner" placeholder="Tal" />
            </div>
          </div>
          <div>
            <label>Next step</label>
            <input name="next_step" />
          </div>
          <button className={buttonClass("primary")}>Add</button>
        </form>
      </Card>
    </div>
  );
}

function PayableCard({ p, today }: { p: Payable; today: string }) {
  const late = p.due_date ? daysBetween(p.due_date, today) : null;
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-medium">
            {p.vendors?.name ? `${p.vendors.name} — ` : ""}
            {p.description}
          </div>
          <div className="mt-1 text-xs text-muted">
            {p.owner ? `Owner: ${p.owner} · ` : ""}
            {p.next_step ? `Next: ${p.next_step}` : "No next step set"}
          </div>
        </div>
        <div className="text-right">
          <div className="tabular font-semibold">{p.amount_cents === null ? "Amount unknown" : formatCents(p.amount_cents)}</div>
          <div className="mt-1 flex justify-end gap-1">
            {p.status === "disputed" ? <Badge tone="info">Disputed</Badge> : <Badge tone={priorityTone(p.priority)}>{p.priority}</Badge>}
            {p.due_date && (
              <Badge tone={late !== null && late > 0 ? "bad" : "muted"}>
                {late !== null && late > 0 ? `${late}d overdue` : `Due ${formatDate(p.due_date)}`}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {p.status === "open" && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-muted hover:text-fg">Mark paid or disputed</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <form action={resolvePayable} className="grid gap-2 rounded-lg border border-line p-3">
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="action" value="paid" />
              <div>
                <label>Paid on *</label>
                <input name="resolved_at" type="date" defaultValue={today} required />
              </div>
              <div>
                <label>Reference *</label>
                <input name="resolved_ref" placeholder="Receipt #, confirmation, check #" required />
              </div>
              <button className={buttonClass("primary")}>Mark paid</button>
            </form>
            <form action={resolvePayable} className="grid gap-2 rounded-lg border border-line p-3">
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="action" value="disputed" />
              <div>
                <label>Why disputed</label>
                <input name="resolved_ref" placeholder="e.g. never delivered, double-billed" />
              </div>
              <button className={buttonClass()}>Mark disputed</button>
            </form>
          </div>
        </details>
      )}
      {p.status === "disputed" && (
        <form action={resolvePayable} className="mt-3">
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="action" value="reopen" />
          <button className="text-sm text-muted underline hover:text-fg">Reopen</button>
        </form>
      )}
    </div>
  );
}
