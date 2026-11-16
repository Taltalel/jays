import { Badge, buttonClass, Card, Empty, Notice, PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { clicksByLink, getLinks } from "@/lib/bookings/data";
import { appUrl, env } from "@/lib/env";
import { shortUrl } from "@/lib/links/core";
import { addDays, nyDate } from "@/lib/time";
import { updateLink } from "./actions";
import { CopyButton, LinkBuilder } from "./builder";

export default async function LinksPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { supabase } = await requireOwner();
  const sp = await searchParams;
  const base = env("SHORT_LINK_BASE") ?? appUrl();
  const today = nyDate();

  let links: Awaited<ReturnType<typeof getLinks>> = [];
  let loadError: string | null = null;
  try {
    links = await getLinks(supabase);
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }
  const [last30, allTime] = loadError
    ? [new Map<string, number>(), new Map<string, number>()]
    : await Promise.all([
        clicksByLink(supabase, addDays(today, -29), addDays(today, 1)),
        clicksByLink(supabase, "2020-01-01", addDays(today, 1)),
      ]);

  return (
    <>
      <PageHeader
        title="Tracked links"
        subtitle="Use these instead of the raw OpenTable, Eventbrite or website link. Each one counts real clicks (link previews and bots are left out) and tags the visit so bookings can be traced back to it."
      />
      {sp.error && <Notice tone="bad">{sp.error}</Notice>}
      {sp.ok && <Notice tone="ok">{sp.ok}</Notice>}
      {loadError && (
        <Notice tone="warn">
          Links aren&apos;t set up in the database yet. Run supabase/migrations/0002_booking_attribution.sql in Supabase. ({loadError})
        </Notice>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-3">
          {links.length === 0 && !loadError && (
            <Empty title="No links yet" reason="The standard links are created by the 0002 setup SQL. You can also create one on the right." />
          )}
          {links.map((l) => {
            const url = shortUrl(base, l.code);
            const isNew = sp.new === l.code;
            return (
              <div key={l.id} className={`rounded-xl border bg-panel p-4 ${isNew ? "border-ok/50" : "border-line"}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{l.label}</span>
                      <Badge tone="info">{l.channel}</Badge>
                      {!l.active && <Badge tone="muted">Paused</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm [overflow-wrap:anywhere]">
                      <span className="text-fg">{url}</span>
                      <CopyButton text={url} />
                    </div>
                    {l.placement && <div className="mt-1 text-xs text-muted">Used in: {l.placement}</div>}
                  </div>
                  <div className="text-right text-sm">
                    <div className="tabular font-semibold">{last30.get(l.id) ?? 0}</div>
                    <div className="text-xs text-dim">clicks, 30 days</div>
                    <div className="tabular mt-1 text-xs text-muted">{allTime.get(l.id) ?? 0} all time</div>
                  </div>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-dim hover:text-fg">Edit · goes to {new URL(l.destination).hostname}</summary>
                  <form action={updateLink} className="mt-3 grid gap-2 sm:grid-cols-2 [&>*]:min-w-0">
                    <input type="hidden" name="id" value={l.id} />
                    <div>
                      <label>Name</label>
                      <input name="label" defaultValue={l.label} />
                    </div>
                    <div>
                      <label>Used in</label>
                      <input name="placement" defaultValue={l.placement ?? ""} />
                    </div>
                    <div className="sm:col-span-2">
                      <label>Sends guests to</label>
                      <input name="destination" defaultValue={l.destination} />
                    </div>
                    <div className="text-xs text-dim sm:col-span-2 [overflow-wrap:anywhere]">
                      Tags added: utm_source={l.utm_source} · utm_medium={l.utm_medium}
                      {l.utm_campaign ? ` · utm_campaign=${l.utm_campaign}` : ""} · utm_content={l.utm_content ?? l.code}
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="active" defaultChecked={l.active} className="w-auto" /> Active
                    </label>
                    <div className="flex justify-end">
                      <button className={buttonClass()}>Save</button>
                    </div>
                  </form>
                </details>
              </div>
            );
          })}
        </div>

        <div className="grid content-start gap-5">
          <Card title="New link">
            <LinkBuilder base={base} />
          </Card>
          <Card title="Rules that keep tracking complete">
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
              <li>Every email, text, post, story, flyer and partner gets its own link. Never paste the raw OpenTable link.</li>
              <li>One link per send (e.g. a new SMS link for each VIP text), so each blast has its own numbers.</li>
              <li>Instagram bio, LinkMe, website Reserve buttons and Google Business Profile use the standing links on the left.</li>
              <li>Eventbrite links get Eventbrite&apos;s own tracking code automatically, so ticket sales show per link in Eventbrite&apos;s report.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
