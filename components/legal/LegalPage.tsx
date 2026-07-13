import { group } from "@/content/group";

export type LegalSection = { heading: string; body: string[] };

/** Shared layout for Privacy / Terms / Cookies. Copy is a starting point —
 *  TODO: have counsel review before launch. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <p className="eyebrow mb-4">Legal</p>
      <h1 className="font-display text-4xl text-champagne md:text-6xl">{title}</h1>
      <p className="mt-4 text-[11px] uppercase tracking-[0.15em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
        Last updated {updated}
      </p>

      <span className="my-10 block rule-gold" aria-hidden="true" />

      <p className="measure text-base leading-relaxed text-sage">{intro}</p>

      <div className="mt-10 flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-2xl text-champagne">{s.heading}</h2>
            <div className="measure mt-3 flex flex-col gap-3 text-base leading-relaxed text-sage">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-sm border border-gold/20 bg-forest/40 p-5">
        <p className="text-sm text-sage">
          Questions? Write to{" "}
          <a href={`mailto:${group.email}`} className="text-champagne hover:text-gold">
            {group.email}
          </a>
          .
        </p>
      </div>

      <p className="mt-6 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="text-[10px] uppercase tracking-[0.15em] text-sage/80" style={{ fontFamily: "var(--font-label)" }}>
          TODO · placeholder policy — replace with counsel-reviewed copy
        </span>
      </p>
    </article>
  );
}
