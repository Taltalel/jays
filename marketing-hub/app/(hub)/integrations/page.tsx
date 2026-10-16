import { Badge, buttonClass, Notice, PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getIntegrationStatuses, type ConnectionState } from "@/lib/integrations/status";
import { lastSync } from "@/lib/spend/queries";
import { formatInstant, timeAgo } from "@/lib/time";
import { checkNow, syncGmailNow } from "./actions";

export const maxDuration = 300;

const STATE: Record<ConnectionState, { label: string; tone: "ok" | "bad" | "muted" }> = {
  connected: { label: "Connected", tone: "ok" },
  error: { label: "Error", tone: "bad" },
  not_connected: { label: "Not connected", tone: "muted" },
};

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { supabase } = await requireOwner();
  const sp = await searchParams;
  const [statuses, gmailRun] = await Promise.all([getIntegrationStatuses(supabase), lastSync(supabase, "gmail")]);
  const connected = statuses.filter((s) => s.state === "connected").length;

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle={`${connected} of ${statuses.length} connected. “Connected” means credentials are set and the last live check passed. Everything is read-only.`}
        actions={
          <form action={checkNow}>
            <button className={buttonClass("primary")}>Check now</button>
          </form>
        }
      />
      {sp.error && <Notice tone="bad">{sp.error}</Notice>}
      {sp.ok && <Notice tone="ok">{sp.ok}</Notice>}

      <div className="grid gap-3">
        {statuses.map(({ def, state, reason, lastCheckAt }) => (
          <details key={def.key} className="group rounded-xl border border-line bg-panel" open={def.phase === 1 && state !== "connected"}>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 p-4 [overflow-wrap:anywhere]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{def.name}</span>
                  <Badge tone={STATE[state].tone}>{STATE[state].label}</Badge>
                  <span className="text-xs text-dim">Phase {def.phase}</span>
                </div>
                <div className={`mt-1 text-sm ${state === "error" ? "text-bad" : "text-muted"}`}>{reason}</div>
              </div>
              <div className="text-xs text-dim" title={lastCheckAt ? formatInstant(lastCheckAt) : undefined}>
                {def.hasCheck ? `Last check: ${timeAgo(lastCheckAt)}` : ""}
              </div>
            </summary>

            <div className="grid gap-4 border-t border-line p-4 text-sm [overflow-wrap:anywhere] md:grid-cols-2 [&>*]:min-w-0">
              <div className="grid gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-dim">Pulls</div>
                  <div className="mt-1">{def.pulls}</div>
                </div>
                {def.knownIds && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-dim">Known IDs</div>
                    <ul className="mt-1 list-disc pl-5 text-muted">
                      {def.knownIds.map((id) => (
                        <li key={id}>{id}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase tracking-wide text-dim">Access</div>
                  <div className="mt-1 text-muted">{def.access}</div>
                </div>
              </div>
              <div className="grid gap-3">
                {def.envVars.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-dim">Env vars (Vercel)</div>
                    <ul className="mt-1 grid gap-1">
                      {def.envVars.map((v) => (
                        <li key={v.name}>
                          <code className="rounded bg-panel-2 px-1 text-xs">{v.name}</code>
                          {v.optional && <span className="text-xs text-dim"> (optional)</span>}
                          <div className="text-xs text-muted">{v.where}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase tracking-wide text-dim">How to connect</div>
                  <ol className="mt-1 list-decimal pl-5 text-muted">
                    {def.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>

                {def.key === "gmail" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <a href="/integrations/gmail/connect" className={buttonClass()}>
                      {state === "connected" ? "Reconnect Gmail" : "Connect Gmail"}
                    </a>
                    {state === "connected" && (
                      <form action={syncGmailNow}>
                        <button className={buttonClass("primary")}>Sync receipts now</button>
                      </form>
                    )}
                    <span className="text-xs text-dim">
                      Last sync: {timeAgo(gmailRun?.finished_at)}
                      {gmailRun?.error ? ` — failed: ${gmailRun.error}` : gmailRun?.rows != null ? ` — ${gmailRun.rows} new rows` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
