"use client";
import { startTransition, useActionState, useRef, useState } from "react";
import { buttonClass } from "@/components/ui";
import { importBookings, type BookingImportState } from "./actions";

export function BookingImporter({ month }: { month: string }) {
  const [state, action, pending] = useActionState<BookingImportState, FormData>(importBookings, {});
  const fileRef = useRef<File | null>(null);
  const [platform, setPlatform] = useState("opentable");
  const [reportMonth, setReportMonth] = useState(month);

  function run(intent: "preview" | "import") {
    if (!fileRef.current) return;
    const fd = new FormData();
    fd.set("file", fileRef.current);
    fd.set("platform", platform);
    fd.set("month", reportMonth);
    fd.set("intent", intent);
    startTransition(() => action(fd));
  }

  const p = state.preview;
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        run(submitter?.value === "import" ? "import" : "preview");
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
        <div>
          <label>From</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="opentable">OpenTable — reservations export</option>
            <option value="eventbrite">Eventbrite — Tracking links report</option>
          </select>
        </div>
        {platform === "eventbrite" && (
          <div>
            <label>Month the report covers</label>
            <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
          </div>
        )}
      </div>
      <div>
        <label>File (CSV or .xlsx)</label>
        <input
          type="file"
          accept=".csv,.xlsx,text/csv"
          required
          onChange={(e) => {
            fileRef.current = e.target.files?.[0] ?? null;
          }}
        />
      </div>
      <p className="text-xs text-dim">
        {platform === "opentable"
          ? "OpenTable for Restaurants → Reports → Reservations (or Guest/Cover reports) → export CSV. Include the Source / Booked via column if offered."
          : "Eventbrite → Reporting → Tracking links → choose the events → export CSV. Run one report per month."}
      </p>
      <div className="flex flex-wrap gap-2">
        <button name="intent" value="preview" className={buttonClass()} disabled={pending}>
          {pending ? "Reading…" : "Preview"}
        </button>
        {p && !state.imported && p.total > 0 && (
          <button name="intent" value="import" className={buttonClass("primary")} disabled={pending}>
            Import
          </button>
        )}
      </div>

      {state.error && <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{state.error}</div>}
      {state.imported && <div className="rounded-lg border border-ok/30 bg-ok/10 px-3 py-2 text-sm text-ok">{state.imported}</div>}
      {p && (
        <div className="rounded-lg border border-line bg-panel-2 p-3 text-xs text-muted [overflow-wrap:anywhere]">
          <div className="text-sm text-fg">
            {p.total} {p.platform === "opentable" ? "reservations" : "tickets"} · {p.matchedToLink} matched to a tracked link ·{" "}
            {p.unattributed} with no source
          </div>
          {Object.keys(p.byChannel).length > 0 && (
            <div className="mt-1">
              By channel:{" "}
              {Object.entries(p.byChannel)
                .map(([c, n]) => `${c} ${n}`)
                .join(" · ")}
            </div>
          )}
          <div className="mt-1">
            Columns read:{" "}
            {Object.entries(p.mapped)
              .map(([f, h]) => `${f} ← “${h}”`)
              .join(" · ") || "none recognised"}
          </div>
          {!p.mapped.source && p.platform === "opentable" && (
            <div className="mt-1 text-warn">
              No source column found, so these bookings can&apos;t be matched to a channel and go to the estimated pool.
              Ask OpenTable for an export that includes the booking source.
            </div>
          )}
          {p.skipped.length > 0 && (
            <div className="mt-1 text-warn">
              Skipped {p.skipped.length}: {p.skipped.slice(0, 6).map((s) => `row ${s.row} (${s.reason})`).join(", ")}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
