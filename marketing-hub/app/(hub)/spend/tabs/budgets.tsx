import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { buttonClass } from "@/components/ui";
import { CHANNELS } from "@/lib/db/types";
import { formatCents } from "@/lib/money";
import { getBudgets, getTransactions, spendByChannel } from "@/lib/spend/queries";
import { addMonths, formatMonth, monthStart, nyDate } from "@/lib/time";
import { saveBudgets } from "../actions";

export async function BudgetsTab({ db, month: monthParam }: { db: SupabaseClient; month?: string }) {
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? `${monthParam}-01` : monthStart(nyDate());
  const [budgets, rows] = await Promise.all([getBudgets(db, month), getTransactions(db, { month: month.slice(0, 7) })]);
  const spent = spendByChannel(rows);
  const byChannel = new Map(budgets.map((b) => [b.channel, b.amount_cents]));
  const channels = [...new Set([...CHANNELS, ...byChannel.keys(), ...spent.keys()])];
  const prev = addMonths(month, -1).slice(0, 7);
  const next = addMonths(month, 1).slice(0, 7);

  return (
    <form action={saveBudgets} className="max-w-2xl">
      <input type="hidden" name="month" value={month} />
      <div className="mb-3 flex items-center justify-between text-sm">
        <Link className="text-muted hover:text-fg" href={`/spend?tab=budgets&month=${prev}`}>
          ← {formatMonth(`${prev}-01`)}
        </Link>
        <span className="font-medium">{formatMonth(month)}</span>
        <Link className="text-muted hover:text-fg" href={`/spend?tab=budgets&month=${next}`}>
          {formatMonth(`${next}-01`)} →
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="tabular w-full text-sm">
          <thead className="bg-panel text-left text-xs text-muted">
            <tr>
              <th className="px-3 py-2">Channel</th>
              <th className="px-3 py-2 text-right">Spent</th>
              <th className="w-40 px-3 py-2">Budget (USD)</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => {
              const b = byChannel.get(c);
              const s = spent.get(c) ?? 0;
              return (
                <tr key={c} className="border-t border-line">
                  <td className="px-3 py-2">{c}</td>
                  <td className={`px-3 py-2 text-right ${b !== undefined && s > b ? "text-bad" : ""}`}>{formatCents(s)}</td>
                  <td className="px-3 py-1.5">
                    <input
                      name={`budget:${c}`}
                      inputMode="decimal"
                      placeholder="No budget"
                      defaultValue={b !== undefined ? (b / 100).toFixed(2) : ""}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-dim">Source: Spend Log (paid minus refunds). Leave a budget blank to remove it.</span>
        <button className={buttonClass("primary")}>Save budgets</button>
      </div>
    </form>
  );
}
