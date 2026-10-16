import Link from "next/link";
import { Badge, Card, Empty, SourceNote, Stat } from "@/components/ui";
import { getAlerts, type AlertSeverity } from "@/lib/alerts";
import { requireOwner } from "@/lib/auth";
import { formatCents } from "@/lib/money";
import { getBudgets, getTransactions, lastSync, spendByChannel, sumSpend } from "@/lib/spend/queries";
import { daysInMonth, formatMonth, monthStart, nyDate } from "@/lib/time";

const SEV: Record<AlertSeverity, { tone: "bad" | "warn" | "info"; label: string }> = {
  urgent: { tone: "bad", label: "Urgent" },
  warning: { tone: "warn", label: "Soon" },
  info: { tone: "info", label: "FYI" },
};

export default async function HomePage() {
  const { supabase } = await requireOwner();
  const today = nyDate();
  const month = monthStart(today);

  const [alerts, mtdRows, budgets, gmailRun] = await Promise.all([
    getAlerts(supabase),
    getTransactions(supabase, { month: month.slice(0, 7) }),
    getBudgets(supabase, month),
    lastSync(supabase, "gmail"),
  ]);

  const spent = sumSpend(mtdRows);
  const byChannel = [...spendByChannel(mtdRows).entries()].sort((a, b) => b[1] - a[1]);
  const budgetTotal = budgets.reduce((s, b) => s + b.amount_cents, 0);
  const day = Number(today.slice(8, 10));
  const pace = budgetTotal ? Math.round((budgetTotal * day) / daysInMonth(month)) : null;
  const budgetMap = new Map(budgets.map((b) => [b.channel, b.amount_cents]));

  return (
    <div className="grid grid-cols-1 gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Home · {formatMonth(month)}</h1>
        <div className="mt-1 text-sm text-muted">
          Phase 1 covers spend. Ads, web, email, events and reviews arrive in later phases.
        </div>
      </div>

      <Card
        title={
          <span className="flex items-center gap-2">
            Needs action today {alerts.length > 0 && <Badge tone={alerts[0].severity === "urgent" ? "bad" : "warn"}>{alerts.length}</Badge>}
          </span>
        }
        footer="Checks: failed payments, overdue and due-soon payables, failing/suspended accounts, duplicate subscriptions, receipts needing review."
      >
        {alerts.length === 0 ? (
          <Empty
            title="Nothing needs action"
            reason="No failed payments, overdue invoices or flagged subscriptions in the data loaded so far. If nothing has been imported yet, this will stay empty — see Integrations."
          />
        ) : (
          <ul className="grid gap-2">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-lg border border-line px-3 py-2">
                <Badge tone={SEV[a.severity].tone}>{SEV[a.severity].label}</Badge>
                <div className="min-w-0 flex-1">
                  {a.href ? (
                    <Link
                      href={a.href}
                      target={a.external ? "_blank" : undefined}
                      rel={a.external ? "noreferrer" : undefined}
                      className="text-sm font-medium hover:underline"
                    >
                      {a.title}
                      {a.external && " ↗"}
                    </Link>
                  ) : (
                    <div className="text-sm font-medium">{a.title}</div>
                  )}
                  <div className="text-xs text-muted">{a.detail}</div>
                  <div className="text-[11px] text-dim">Source: {a.source}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Month-to-date spend" footer={<SourceNote source="Spend Log (paid minus refunds)" syncedAt={gmailRun?.finished_at ?? null} />}>
          <div className="grid grid-cols-2 gap-4">
            <Stat label={`Spent, ${formatMonth(month)} 1–${day}`} value={formatCents(spent, { whole: true })} />
            <Stat
              label="Budget"
              value={budgetTotal ? formatCents(budgetTotal, { whole: true }) : "Not set"}
              sub={
                pace !== null ? (
                  <span className={spent > pace ? "text-bad" : "text-ok"}>
                    {spent > pace ? "Ahead of" : "Within"} pace ({formatCents(pace, { whole: true })} by today)
                  </span>
                ) : (
                  <Link href="/spend?tab=budgets" className="underline">
                    Set monthly budgets
                  </Link>
                )
              }
            />
          </div>
          {budgetTotal > 0 && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-panel-2">
              <div
                className={`h-full ${spent > budgetTotal ? "bg-bad" : spent > (pace ?? 0) ? "bg-warn" : "bg-ok"}`}
                style={{ width: `${Math.min(100, (spent / budgetTotal) * 100)}%` }}
              />
            </div>
          )}
        </Card>

        <Card title="Spend by channel (MTD)" footer={<SourceNote source="Spend Log; channel from transaction or vendor" />}>
          {byChannel.length === 0 ? (
            <Empty title="No spend this month yet" reason="No paid transactions dated this month have been imported or entered." />
          ) : (
            <ul className="grid gap-2 text-sm">
              {byChannel.map(([channel, cents]) => {
                const b = budgetMap.get(channel);
                return (
                  <li key={channel} className="flex items-center justify-between gap-3">
                    <Link href={`/spend?tab=log&month=${month.slice(0, 7)}&channel=${encodeURIComponent(channel)}`} className="hover:underline">
                      {channel}
                    </Link>
                    <span className="tabular">
                      {formatCents(cents, { whole: true })}
                      {b !== undefined && <span className={`ml-1 text-xs ${cents > b ? "text-bad" : "text-dim"}`}>/ {formatCents(b, { whole: true })}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Cost per reservation / ticket">
        <Empty
          title="Not measurable yet"
          reason="Needs reservations (OpenTable) and tickets (Eventbrite), which connect in Phase 3. Shown here only once both spend and outcomes are real."
        />
      </Card>
    </div>
  );
}
