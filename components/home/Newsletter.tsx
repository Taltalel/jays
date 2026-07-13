"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Newsletter capture. TODO: wire to Klaviyo or Mailchimp (POST the email to
 * the list API / form endpoint). For now it validates client-side and confirms.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      setStatus("error");
      return;
    }
    // TODO: send `email` to Klaviyo/Mailchimp here.
    setStatus("done");
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
                className="rounded-sm bg-gold px-6 py-3 text-[12px] uppercase tracking-[0.15em] text-forest-deep transition-colors hover:bg-gold-light"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Join
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm text-gold-light" role="alert">
              That email doesn&apos;t look right. Try again?
            </p>
          )}
          <p className="mt-4 text-xs text-sage">No spam. No small talk. Just the good nights.</p>
        </Reveal>
      </div>
    </section>
  );
}
