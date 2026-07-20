"use client";

import { useState } from "react";

/**
 * Reusable inquiry form (Private Events, Careers, Contact).
 *
 * Static-export friendly: on submit it POSTs the submission to FormSubmit
 * (https://formsubmit.co/ajax/<inbox>), which emails it to the routed inbox —
 * no backend required. The first submission to a new inbox triggers a one-time
 * activation email FormSubmit sends to that address; click Activate once and
 * every form is live. Set NEXT_PUBLIC_FORM_ENDPOINT to override with your own
 * provider (Formspree / Basin / a serverless route). Includes a honeypot.
 * If the POST fails, it degrades to a prefilled mailto.
 */

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  full?: boolean; // span both columns
};

export function InquiryForm({
  fields,
  inbox,
  subject,
  submitLabel = "Send",
  confirm = "Thank you — we'll come back to you within 24 hours.",
  defaults,
}: {
  fields: Field[];
  inbox: string;
  subject: string;
  submitLabel?: string;
  confirm?: string;
  /** Preset field values (e.g. the venue on /careers/[venue]). */
  defaults?: Record<string, string>;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — bots fill hidden fields.
    if (data.get("company")) {
      setStatus("done");
      return;
    }

    // Required validation
    for (const f of fields) {
      if (f.required && !String(data.get(f.name) ?? "").trim()) {
        setError(`Please complete “${f.label}”.`);
        setStatus("error");
        return;
      }
    }
    const email = String(data.get("email") ?? "");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email doesn't look right.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError("");

    const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT || `https://formsubmit.co/ajax/${inbox}`;
    const payload: Record<string, string> = {
      _subject: subject,
      _template: "table",
      _captcha: "false",
    };
    fields.forEach((f) => (payload[f.name] = String(data.get(f.name) ?? "")));

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("done");
      form.reset();
      return;
    } catch {
      // fall through to mailto
    }

    // Fallback: open a prefilled email to the routed inbox.
    const body = fields
      .map((f) => `${f.label}: ${payload[f.name] || "—"}`)
      .join("\n");
    window.location.href = `mailto:${inbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("done");
    form.reset();
  }

  if (status === "done") {
    return (
      <div className="rounded-sm border border-gold/25 bg-forest/50 p-8 text-center">
        <p className="font-display text-2xl text-champagne">{confirm}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2" noValidate>
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {fields.map((f) => (
        <div key={f.name} className={`flex flex-col gap-2 ${f.full || f.type === "textarea" ? "md:col-span-2" : ""}`}>
          <label htmlFor={f.name} className="text-[11px] uppercase tracking-[0.15em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
            {f.label}
            {f.required && <span className="text-gold"> *</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea id={f.name} name={f.name} rows={5} placeholder={f.placeholder} defaultValue={defaults?.[f.name]} className={inputCls} />
          ) : f.type === "select" ? (
            <select id={f.name} name={f.name} className={inputCls} defaultValue={defaults?.[f.name] ?? ""}>
              <option value="" disabled>
                Choose…
              </option>
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input id={f.name} name={f.name} type={f.type ?? "text"} placeholder={f.placeholder} defaultValue={defaults?.[f.name]} className={inputCls} />
          )}
        </div>
      ))}

      <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-sm bg-gold px-8 py-3 text-[12px] uppercase tracking-[0.15em] text-forest-deep transition-colors hover:bg-gold-light disabled:opacity-60"
          style={{ fontFamily: "var(--font-label)" }}
        >
          {status === "sending" ? "Sending…" : submitLabel}
        </button>
        {status === "error" && (
          <p className="text-sm text-gold-light" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-sm border border-champagne/20 bg-forest-deep/60 px-4 py-3 text-base text-champagne placeholder:text-sage/50 focus:border-gold focus:outline-none";
