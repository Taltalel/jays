import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Placeholder } from "@/components/ui/Placeholder";
import { InquiryForm, type Field } from "@/components/ui/InquiryForm";
import { whatWeHost, capacities, collinsSpaces, cateringCollections, eventTerms } from "@/content/events";
import { group } from "@/content/group";

export const metadata: Metadata = {
  title: "Private Events — Take the whole room",
  description:
    "Buyouts, private dining and brand events across Room 7's four rooms in Fort Lauderdale and Miami Beach. Tell us the night; we'll build it.",
  alternates: { canonical: "https://room7hospitality.com/private-events/" },
};

const fields: Field[] = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "venue", label: "Venue", type: "select", options: ["Jay's", "Naked Taco", "HighBar", "Riviera", "Not sure yet"] },
  { name: "date", label: "Preferred date", type: "date" },
  { name: "guests", label: "Guest count", type: "number" },
  { name: "eventType", label: "Event type", type: "select", options: ["Buyout", "Private dining", "Brand / press", "Corporate", "Celebration", "Other"] },
  { name: "message", label: "Tell us about the night", type: "textarea", full: true },
];

const gallery = [
  { src: "/venues/highbar-hero.webp", alt: "A rooftop set for a buyout at HighBar" },
  { src: "/venues/jays-interior.webp", alt: "Candlelit private dining at Jay's" },
  { src: "/venues/jays-cocktail.webp", alt: "A toast — a signature cocktail at Jay's" },
  { src: "/venues/naked-taco-hero.webp", alt: "Naked Taco, mid-service" },
];

export default function PrivateEventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Private Events"
        title="Take the whole room."
        sub="Buyouts, private dining, and the kind of party people cancel other plans for. Four rooms across South Florida — pick your stage."
        tone="view"
        placeholder="A full room mid-party — buyout energy"
        image="/venues/highbar-hero.webp"
        imagePosition="50% 50%"
      />

      {/* What we host */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <Reveal className="mb-10 md:mb-14">
          <p className="eyebrow mb-3">What We Host</p>
          <h2 className="h2-display text-champagne">However you want the night to go.</h2>
        </Reveal>
        <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {whatWeHost.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 50}>
              <h3 className="font-display text-2xl text-champagne">{w.title}</h3>
              <span className="mt-3 block h-px w-14 bg-gold/50" aria-hidden="true" />
              <p className="mt-3 text-base text-sage">{w.line}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Capacity by venue */}
      <section className="border-y border-champagne/10 bg-forest/40">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
          <Reveal className="mb-8">
            <p className="eyebrow mb-3">Capacities</p>
            <h2 className="h2-display text-champagne">Room by room.</h2>
          </Reveal>
          <ul className="flex flex-col">
            {capacities.map((c, i) => (
              <Reveal as="li" key={c.venue} delay={i * 50}>
                <div className="flex flex-col gap-2 border-b border-champagne/10 py-5 md:flex-row md:items-baseline md:justify-between md:gap-8">
                  <div className="md:w-1/3">
                    <h3 className="font-display text-2xl text-champagne">{c.venue}</h3>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                      {c.nickname}
                    </p>
                  </div>
                  <p className="text-sage md:flex-1">{c.note}</p>
                  <p className="font-display text-xl text-champagne md:w-28 md:text-right">{c.capacity}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="mt-4 text-xs text-sage">* Naked Taco + HighBar host 50–275 guests across three spaces at 1111 Collins Avenue.</p>
        </div>
      </section>

      {/* Collins Avenue — three real spaces */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <Reveal className="mb-10 md:mb-14">
          <p className="eyebrow mb-3">1111 Collins Avenue</p>
          <h2 className="h2-display max-w-2xl text-champagne">One address, three ways to throw it.</h2>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {collinsSpaces.map((s, i) => (
            <Reveal key={s.name} delay={(i % 3) * 60}>
              <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                {s.kind}
              </p>
              <h3 className="mt-2 font-display text-2xl text-champagne">{s.name}</h3>
              <span className="mt-3 block h-px w-14 bg-gold/50" aria-hidden="true" />
              <p className="mt-3 text-base text-sage">{s.line}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Catering collections + how it works */}
      <section className="border-y border-champagne/10 bg-forest/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
          <Reveal>
            <p className="eyebrow mb-3">The Catering Collection</p>
            <h2 className="h2-display text-champagne">Menus, your way.</h2>
            <ul className="mt-8 flex flex-col">
              {cateringCollections.map((c) => (
                <li key={c.name} className="border-b border-champagne/10 py-4">
                  <span className="font-display text-xl text-champagne">{c.name}</span>
                  <p className="text-sm text-sage">{c.line}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <p className="eyebrow mb-3">How It Works</p>
            <h2 className="h2-display text-champagne">The house rules.</h2>
            <ul className="mt-8 flex flex-col gap-4">
              {eventTerms.map((t) => (
                <li key={t} className="flex gap-3 text-base text-sage">
                  <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {gallery.map((g, i) => (
            <Reveal key={i} delay={(i % 4) * 40}>
              <div className="relative aspect-square overflow-hidden rounded-sm">
                <Placeholder tone={i % 2 ? "night" : "riot"} seed={`ev-${i}`} src={g.src} alt={g.alt} showLabel={false} className="absolute inset-0" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Inquiry form */}
      <section className="border-t border-champagne/10 bg-forest-deep">
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          <Reveal className="mb-10 text-center">
            <p className="eyebrow mb-3">Inquire</p>
            <h2 className="h2-display text-champagne">Tell us the night.</h2>
            <p className="measure mx-auto mt-4 text-base text-sage">
              A few details and we’ll come back to you within 24 hours with a plan.
            </p>
          </Reveal>
          <InquiryForm
            fields={fields}
            inbox={group.inboxes.events}
            subject="Private event inquiry — Room 7"
            submitLabel="Send inquiry"
            analytics={{ event: "event_inquiry_submit", venueField: "venue", eventTypeField: "eventType" }}
          />
        </div>
      </section>
    </>
  );
}
