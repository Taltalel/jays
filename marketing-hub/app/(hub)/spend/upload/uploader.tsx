"use client";
import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { BRANDS, CHANNELS, TXN_STATUSES } from "@/lib/db/types";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { confirmReceipt, createReceiptUpload, parseUploadedReceipt, type ParsedForConfirm } from "./actions";

type Step = { kind: "pick" } | { kind: "working"; label: string } | { kind: "confirm"; data: ParsedForConfirm };

export function Uploader() {
  const [step, setStep] = useState<Step>({ kind: "pick" });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onFile(file: File) {
    setError(null);
    setStep({ kind: "working", label: "Uploading…" });
    const slot = await createReceiptUpload({ type: file.type, size: file.size });
    if ("error" in slot) {
      setError(slot.error ?? "Upload failed.");
      return setStep({ kind: "pick" });
    }
    const { error: upErr } = await supabaseBrowser().storage.from("receipts").uploadToSignedUrl(slot.path, slot.token, file, {
      contentType: file.type,
    });
    if (upErr) {
      setError(`Upload failed: ${upErr.message}`);
      return setStep({ kind: "pick" });
    }
    setStep({ kind: "working", label: "Reading the receipt with AI…" });
    const parsed = await parseUploadedReceipt(slot.path);
    if ("error" in parsed) {
      setError(parsed.error);
      return setStep({ kind: "pick" });
    }
    setStep({ kind: "confirm", data: parsed });
  }

  if (step.kind === "working") {
    return <div className="rounded-xl border border-line bg-panel p-6 text-sm text-muted">{step.label}</div>;
  }

  if (step.kind === "pick") {
    return (
      <div className="rounded-xl border border-dashed border-line bg-panel p-6">
        {error && <div className="mb-4 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{error}</div>}
        <label className="text-sm text-fg">Receipt or invoice (PDF up to 20 MB, or a photo/screenshot up to 5 MB)</label>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
          className="mt-2"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
        <p className="mt-3 text-xs text-dim">
          The file is stored privately. AI reads it and you confirm every field before anything is booked. Full card
          numbers are never saved — last 4 only.
        </p>
      </div>
    );
  }

  const { data } = step;
  const p = data.parsed;
  return (
    <form
      action={(fd) => start(() => confirmReceipt(fd))}
      className="grid gap-4 rounded-xl border border-line bg-panel p-4"
    >
      <input type="hidden" name="path" value={data.path} />
      <input type="hidden" name="hash" value={data.hash} />
      <input type="hidden" name="confidence" value={p.confidence} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-medium">Confirm what the AI found</div>
        <div className={`text-xs ${data.needsReview ? "text-warn" : "text-ok"}`}>
          AI confidence {Math.round(p.confidence * 100)}%
        </div>
      </div>

      {!p.is_receipt && (
        <div className="rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
          This doesn&apos;t look like a receipt or invoice. Check before saving.
        </div>
      )}
      {data.duplicateOf && (
        <div className="rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
          This exact file was uploaded before. Saving will be skipped as a duplicate.
        </div>
      )}
      {data.reasons.length > 0 && (
        <div className="rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
          Needs a closer look: {data.reasons.join(" · ")}
        </div>
      )}
      {p.notes && <div className="text-sm text-muted">AI note: {p.notes}</div>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Vendor *" name="vendor" defaultValue={p.vendor} />
        <Field label="Amount (USD) *" name="amount" defaultValue={data.amount} inputMode="decimal" />
        <Field label="Date *" name="date" defaultValue={p.date} type="date" />
        <div>
          <label>Status</label>
          <select name="status" defaultValue={p.status ?? "paid"}>
            {TXN_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Channel</label>
          <select name="channel" defaultValue={p.suggested_channel ?? ""}>
            <option value="">—</option>
            {CHANNELS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Brand</label>
          <select name="brand" defaultValue={p.suggested_brand ?? ""}>
            <option value="">—</option>
            {BRANDS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <Field label="Invoice / ref" name="invoice_ref" defaultValue={p.invoice_ref} />
        <Field label="Card last 4" name="card_last4" defaultValue={p.card_last4} inputMode="numeric" maxLength={4} />
        <Field label="Period start" name="period_start" defaultValue={p.period_start} type="date" />
        <Field label="Period end" name="period_end" defaultValue={p.period_end} type="date" />
        <div className="sm:col-span-2">
          <Field label="Description" name="description" defaultValue={p.description} />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className={buttonClass()} onClick={() => setStep({ kind: "pick" })} disabled={pending}>
          Start over
        </button>
        <button name="intent" value="review" className={buttonClass()} disabled={pending}>
          Save to Needs review
        </button>
        <button name="intent" value="book" className={buttonClass("primary")} disabled={pending}>
          {pending ? "Saving…" : "Confirm & book"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  ...rest
}: { label: string; name: string; defaultValue: string | null | undefined } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  return (
    <div>
      <label>{label}</label>
      <input name={name} defaultValue={defaultValue ?? ""} {...rest} />
    </div>
  );
}
