"use client";

import { useMemo, useState } from "react";
import { roles, venueLabels, type VenueKey } from "@/content/careers";

/** Open roles, filterable by venue (Groot does this). */
export function RolesBrowser({ initial = "all" }: { initial?: VenueKey | "all" }) {
  const [filter, setFilter] = useState<VenueKey | "all">(initial);

  const keys: (VenueKey | "all")[] = ["all", "jays", "naked-taco", "highbar", "riviera", "group"];
  const shown = useMemo(() => (filter === "all" ? roles : roles.filter((r) => r.venue === filter)), [filter]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            aria-pressed={filter === k}
            className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${
              filter === k
                ? "border-gold bg-gold text-forest-deep"
                : "border-champagne/20 text-champagne/80 hover:border-gold/50 hover:text-gold"
            }`}
            style={{ fontFamily: "var(--font-label)" }}
          >
            {k === "all" ? "All rooms" : venueLabels[k]}
          </button>
        ))}
      </div>

      <ul className="flex flex-col">
        {shown.map((r, i) => (
          <li key={`${r.venue}-${r.title}-${i}`} className="border-b border-champagne/10">
            <div className="flex flex-col gap-2 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-2xl text-champagne">{r.title}</h3>
                <p className="text-[11px] uppercase tracking-[0.14em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  {venueLabels[r.venue]} · {r.team}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-sage">{r.location}</span>
                <span className="rounded-full border border-champagne/20 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
                  {r.type}
                </span>
                <a
                  href="#apply"
                  className="text-[12px] uppercase tracking-[0.15em] text-champagne transition-colors hover:text-gold"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  Apply →
                </a>
              </div>
            </div>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="py-8 text-center text-sage">No open roles here right now — but we always want to meet good people. Introduce yourself below.</li>
        )}
      </ul>
    </div>
  );
}
