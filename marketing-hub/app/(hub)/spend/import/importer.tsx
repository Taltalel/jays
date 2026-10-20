"use client";
import Link from "next/link";
import { startTransition, useActionState, useRef } from "react";
import { buttonClass } from "@/components/ui";
import { importWorkbook, type ImportState } from "./actions";

const FIELD_LABELS: Record<string, string> = {
  invoice_ref: "invoice/ref",
  next_step: "next step",
  due_date: "due date",
  billing_day: "billing day",
  period_start: "period start",
  period_end: "period end",
  usual: "usual amount",
  action: "action note",
};

export function Importer() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importWorkbook, {});
  // Kept here rather than relying on the input: React resets a form after its
  // action runs, which would clear the file between Preview and Import.
  const fileRef = useRef<File | null>(null);

  function run(intent: "preview" | "import") {
    if (!fileRef.current) return;
    const fd = new FormData();
    fd.set("file", fileRef.current);
    fd.set("intent", intent);
    startTransition(() => action(fd));
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        run(submitter?.value === "import" ? "import" : "preview");
      }}
    >
      <div className="rounded-xl border border-dashed border-line bg-panel p-5">
        <label className="text-sm text-fg">Jays-Marketing-Spend-Log.xlsx</label>
        <input type="file" name="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="mt-2"
          required
          onChange={(e) => {
            fileRef.current = e.target.files?.[0] ?? null;
          }}
        />
        <p className="mt-3 text-xs text-dim">
          Reads the Monthly Payments, Outstanding — To Pay and Spend Log tabs. Preview first: nothing is saved until you
          press Import. Importing twice never creates duplicates, and items you already marked paid stay paid. Only the
          last 4 digits of any card number are kept.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button name="intent" value="preview" className={buttonClass()} disabled={pending}>
            {pending ? "Reading…" : "Preview"}
          </button>
          {state.canImport && !state.imported && (
            <button name="intent" value="import" className={buttonClass("primary")} disabled={pending}>
              Import
            </button>
          )}
        </div>
      </div>

      {state.error && <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{state.error}</div>}
      {state.imported && (
        <div className="rounded-lg border border-ok/30 bg-ok/10 px-3 py-2 text-sm text-ok">
          {state.imported}{" "}
          <Link href="/spend" className="underline">
            Open Spend →
          </Link>
        </div>
      )}
      {state.summary && <div className="text-sm">{state.summary}</div>}

      {state.reports?.map(({ name, report }) => (
        <div key={name} className="rounded-xl border border-line bg-panel p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-medium">{name}</div>
            <div className={report.sheet ? "text-muted" : "text-warn"}>
              {report.sheet ? `tab “${report.sheet}” · ${report.rows} rows` : "Tab not found — nothing will be imported from it"}
            </div>
          </div>
          {report.sheet && (
            <div className="mt-2 grid gap-1 text-xs text-muted [overflow-wrap:anywhere]">
              <div>
                Reading:{" "}
                {Object.entries(report.mapped)
                  .map(([f, h]) => `${FIELD_LABELS[f] ?? f} ← “${h}”`)
                  .join(" · ") || "no recognised columns"}
              </div>
              {report.unmapped.length > 0 && <div className="text-dim">Ignored columns: {report.unmapped.join(", ")}</div>}
              {report.skipped.length > 0 && (
                <div className="text-warn">
                  Skipped {report.skipped.length}:{" "}
                  {report.skipped
                    .slice(0, 8)
                    .map((s) => `row ${s.row} (${s.reason})`)
                    .join(", ")}
                  {report.skipped.length > 8 && ` and ${report.skipped.length - 8} more`}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </form>
  );
}
