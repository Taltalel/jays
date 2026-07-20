"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { group } from "@/content/group";

/**
 * Newsletter capture — signups are delivered to the marketing inbox via
 * FormSubmit (no backend). Swap the endpoint for Klaviyo/Mailchimp when a list
 * is set up. NEXT_PUBLIC_FORM_ENDPOINT overrides the destination if set.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT || `https://formsubmit.co/ajax/${group.inboxes.general}`;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: "Newsletter signup — Room 7", _template: "table", _captcha: "false", email }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="border-t border-champagne/10 bg-forest/40">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        <Reveal>
          <p className="eyebrow mb-4">Get on the list</p>
          <h2 className="h2-display text-champagne">
            New rooms, new menus, and the nights worth showing up for.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          {status === "done" ? (
            <p className="mx-auto mt-8 max-w-md text-pretty text-base text-champagne">
              You&apos;re on the list. Save us a seat in your calendar — we&apos;ll do the rest.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
              <label htmlFor="nl-email" className="sr-only">
                Email address
              </label>
              <input
                id="nl-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                className="min-w-0 flex-1 rounded-sm border border-champagne/20 bg-forest-deep/60 px-4 py-3 text-base text-champagne placeholder:text-sage/60 focus:border-gold focus:outline-none"
                aria-invalid={status === "error"}
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-sm bg-gold px-6 py-3 text-[12px] uppercase tracking-[0.15em] text-forest-deep transition-colors hover:bg-gold-light disabled:opacity-60"
                style={{ fontFamily: "var(--font-label)" }}
              >
                {status === "sending" ? "Joining…" : "Join"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm text-gold-light" role="alert">
              That didn&apos;t go through — check the email and try again?
            </p>
          )}
          <p className="mt-4 text-xs text-sage">No spam. No small talk. Just the good nights.</p>
        </Reveal>
      </div>
    </section>
  );
}
