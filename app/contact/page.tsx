import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { InquiryForm, type Field } from "@/components/ui/InquiryForm";
import { group } from "@/content/group";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Room 7, general, private events, press or careers. Fort Lauderdale hospitality group behind Jay's, Naked Taco, HIGHBAR and Riviera.",
  alternates: { canonical: "https://room7hospitality.com/contact/" },
};

const routes = [
  { label: "General", line: "Anything and everything else.", href: "#reach" },
  { label: "Private Events", line: "Buyouts, private dining, brand nights.", href: "/private-events" },
  { label: "Press", line: "Interviews, assets, the press kit.", href: "/press" },
  { label: "Careers", line: "Roles across the four rooms.", href: "/careers" },
];

const fields: Field[] = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "reason", label: "About", type: "select", options: ["General", "Private events", "Press", "Careers", "Feedback"] },
  { name: "message", label: "Message", type: "textarea", required: true, full: true },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Say hello."
        sub="Four ways to reach the house. Pick the one that fits, we'll get it to the right room."
        tone="church"
        placeholder="The house, front of the room"
        image="/venues/jays-cocktail.webp"
        imagePosition="50% 40%"
        short
      />

      {/* Route cards */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((r, i) => (
            <Reveal key={r.label} delay={(i % 4) * 50}>
              <Link href={r.href} className="group flex h-full flex-col rounded-sm border border-champagne/10 bg-forest/40 p-6 transition-colors hover:border-gold/40">
                <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>{r.label}</p>
                <p className="mt-3 flex-1 text-sm text-sage">{r.line}</p>
                <span className="mt-4 text-[12px] uppercase tracking-[0.15em] text-champagne/80 group-hover:text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  Go →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Form + house info */}
      <section id="reach" className="scroll-mt-24 border-t border-champagne/10 bg-forest-deep">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
          <Reveal>
            <p className="eyebrow mb-3">Message</p>
            <h2 className="h2-display mb-8 text-champagne">Drop us a line.</h2>
            <InquiryForm fields={fields} inbox={group.email} subject="Contact, Room 7" submitLabel="Send" />
          </Reveal>

          <Reveal delay={80}>
            <p className="eyebrow mb-3">The House</p>
            <h2 className="h2-display text-champagne">Reach the right room.</h2>
            <address className="mt-6 flex flex-col gap-2 not-italic text-sage">
              <span>Fort Lauderdale, Florida</span>
              <a href={`mailto:${group.email}`} className="text-champagne underline underline-offset-4 decoration-champagne/40 hover:text-gold">{group.email}</a>
            </address>
            <Link
              href="/collection"
              className="group mt-8 flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-sm border border-champagne/10 bg-forest p-8 text-center transition-colors hover:border-gold/40"
            >
              <span className="eyebrow mb-1">Visit</span>
              <span className="font-display text-2xl text-champagne md:text-3xl">Find every room</span>
              <span className="text-sm text-sage">Fort Lauderdale &amp; Miami Beach</span>
              <span className="mt-3 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-gold transition-colors group-hover:text-gold-light" style={{ fontFamily: "var(--font-label)" }}>
                See the collection <span aria-hidden="true">→</span>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
