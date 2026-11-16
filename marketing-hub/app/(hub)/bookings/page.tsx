import Link from "next/link";
import { Badge, buttonClass, Card, Empty, Notice, PageHeader, Stat } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { bookingReport, getBookings } from "@/lib/bookings/data";
import { ATTRIBUTION_CHANNELS } from "@/lib/links/core";
import { formatCents } from "@/lib/money";
import { addMonths, formatDate, formatMonth, monthStart, nyDate } from "@/lib/time";
import { addTally, deleteTally } from "./actions";
import { BookingImporter } from "./importer";

export const maxDuration = 120;

export default async function BookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { supabase } = await requireOwner();
  const sp = await searchParams;
  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : nyDate().slice(0, 7);
  const prev = addMonths(`${month}-01`, -1).slice(0, 7);
  const next = addMonths(`${month}-01`, 1).slice(0, 7);

  let report: Awaited<ReturnType<typeof bookingReport>> | null = null;
  let loadError: string | null = null;
  try {
    report = await bookingReport(supabase, month);
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }
  const tallies = report
    ? (await getBookings(supabase, report.from, report.to)).filter((b) => b.platform === "manual")
    : [];

  return (
    <>
      <PageHeader
        title="Bookings by source"
        subtitle={
          <span>
            Where every reservation, ticket and experience came from. <b>Confirmed</b> = matched to a tracked link, the
            platform&apos;s own source, or a host-stand/offer-code tally. <b>Estimated</b> = OpenTable bookings with no
            usable source, shared out by each channel&apos;s clicks to OpenTable.
          </span>
        }
        actions={
          <div className="flex items-center gap-3 text-sm">
            <Link className="text-muted hover:text-fg" href={`/bookings?month=${prev}`}>
              ← {formatMonth(`${prev}-01`)}
            </Link>
            <span className="font-medium">{formatMonth(`${month}-01`)}</span>
            {month < nyDate().slice(0, 7) && (
              <Link className="text-muted hover:text-fg" href={`/bookings?month=${next}`}>
                {formatMonth(`${next}-01`)} →
              </Link>
            )}
          </div>
        }
      />
      {sp.error && <Notice tone="bad">{sp.error}</Notice>}
      {sp.ok && <Notice tone="ok">{sp.ok}</Notice>}
      {loadError && (
        <Notice tone="warn">
          Booking tracking isn&apos;t set up in the database yet. Run supabase/migrations/0002_booking_attribution.sql in
          Supabase. ({loadError})
        </Notice>
      )}

      {report && (
        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-panel p-4 md:grid-cols-5">
            <Stat label="Link clicks (people)" value={report.totals.clicks} />
            <Stat label="Reservations & experiences" value={report.totals.bookings} />
            <Stat label="Event tickets" value={report.totals.tickets} />
            <Stat label="Covers" value={report.totals.covers || "—"} />
            <Stat
              label="Click → booking (OpenTable)"
              value={report.poolRate !== null ? `${Math.round(report.poolRate * 100)}%` : "—"}
              sub="estimate"
            />
          </div>

          {!report.hasBookings && (
            <Notice tone="info">
              No bookings imported for {formatMonth(`${month}-01`)} yet. Clicks are counted live; import OpenTable and
              Eventbrite exports below to see bookings by channel.
            </Notice>
          )}

          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="tabular w-full min-w-[820px] text-sm">
              <thead className="bg-panel text-left text-xs text-muted">
                <tr>
                  <th className="px-3 py-2">Channel</th>
                  <th className="px-3 py-2 text-right">Clicks</th>
                  <th className="px-3 py-2 text-right">Confirmed bookings</th>
                  <th className="px-3 py-2 text-right">Estimated bookings</th>
                  <th className="px-3 py-2 text-right">Tickets</th>
                  <th className="px-3 py-2 text-right">Covers</th>
                  <th className="px-3 py-2 text-right">Spend</th>
                  <th className="px-3 py-2 text-right">Cost / booking</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-muted">
                      No clicks, bookings or spend recorded for this month yet.
                    </td>
                  </tr>
                )}
                {report.rows.map((r) => (
                  <tr key={r.channel} className="border-t border-line">
                    <td className="px-3 py-2 font-medium">{r.channel}</td>
                    <td className="px-3 py-2 text-right">{r.humanClicks || "—"}</td>
                    <td className="px-3 py-2 text-right">{r.confirmedBookings || "—"}</td>
                    <td className="px-3 py-2 text-right text-muted">{r.estimatedBookings ? `~${r.estimatedBookings}` : "—"}</td>
                    <td className="px-3 py-2 text-right">{r.tickets || "—"}</td>
                    <td className="px-3 py-2 text-right">{r.covers || "—"}</td>
                    <td className="px-3 py-2 text-right">{r.spendCents ? formatCents(r.spendCents, { whole: true }) : "—"}</td>
                    <td className="px-3 py-2 text-right">
                      {r.costPerBookingCents !== null ? (
                        <span title="Spend ÷ (confirmed + estimated + tickets). Estimate.">~{formatCents(r.costPerBookingCents)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="-mt-3 text-xs text-dim">
            Sources: clicks from tracked links (live); bookings from OpenTable and Eventbrite imports and host-stand
            tallies; spend from the Spend Log. {report.openTablePool > 0 && `${report.openTablePool} OpenTable bookings had no usable source and are shared out as estimates. `}
            {report.unattributedOther > 0 && `${report.unattributedOther} other bookings have no source.`}
          </p>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="Import bookings">
              <BookingImporter month={month} />
            </Card>

            <Card title="Host stand & offer codes">
              <p className="mb-3 text-sm text-muted">
                For bookings links can&apos;t see: phone, walk-ins, and guests who answer &quot;How did you hear about
                us?&quot; or use a channel&apos;s offer code.
              </p>
              <form action={addTally} className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
                <div>
                  <label>Date</label>
                  <input type="date" name="date" defaultValue={month === nyDate().slice(0, 7) ? nyDate() : monthStart(`${month}-01`)} required />
                </div>
                <div>
                  <label>Heard about us from</label>
                  <select name="channel" defaultValue="Instagram">
                    {ATTRIBUTION_CHANNELS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>How many bookings</label>
                  <input name="count" inputMode="numeric" defaultValue="1" required />
                </div>
                <div>
                  <label>Covers (optional)</label>
                  <input name="covers" inputMode="numeric" />
                </div>
                <div>
                  <label>Recorded via</label>
                  <select name="how" defaultValue="host_stand">
                    <option value="host_stand">Host stand / asked guest</option>
                    <option value="offer_code">Offer code</option>
                  </select>
                </div>
                <div>
                  <label>Note / code</label>
                  <input name="note" placeholder="e.g. IGNOV" />
                </div>
                <div className="flex justify-end sm:col-span-2">
                  <button className={buttonClass("primary")}>Add</button>
                </div>
              </form>
              {tallies.length > 0 && (
                <ul className="mt-4 grid gap-1 text-sm">
                  {tallies.slice(0, 20).map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 border-t border-line pt-1">
                      <span>
                        {formatDate(t.booked_on)} · <b>{t.channel}</b> × {t.quantity}
                        {t.covers ? ` (${t.covers} covers)` : ""} <span className="text-dim">{t.source_label}</span>
                      </span>
                      <form action={deleteTally}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="month" value={month} />
                        <button className="text-xs text-dim hover:text-bad">Remove</button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card title="Every tracked link this month">
            {report.perLink.length === 0 ? (
              <Empty title="No tracked links yet" reason="Create them on the Links page." action={<Link className={buttonClass()} href="/links">Open Links</Link>} />
            ) : (
              <ul className="grid gap-1 text-sm">
                {report.perLink
                  .sort((a, b) => b.clicks - a.clicks)
                  .map(({ link, clicks, bookings }) => (
                    <li key={link.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-1.5 first:border-0">
                      <span className="min-w-0">
                        {link.label} <Badge tone="muted">{link.channel}</Badge>
                      </span>
                      <span className="tabular text-muted">
                        {clicks} clicks · {bookings} confirmed
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
