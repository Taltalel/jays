import { CTA } from "@/components/ui/CTA";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { venueParam } from "@/lib/analytics";
import type { Venue } from "@/content/venues";

/** VISIT, address, hours, phone, map, reserve. */
export function VenueVisit({ venue }: { venue: Venue }) {
  const q = encodeURIComponent(`${venue.name}, ${venue.address.street}, ${venue.address.locality}`);
  const vp = venueParam(venue.slug);
  return (
    <section className="border-t border-champagne/10 bg-forest/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
        <div>
          <p className="eyebrow mb-6">Visit</p>
          <h2 className="h2-display text-champagne">{venue.name}</h2>

          <div className="mt-8 flex flex-col gap-6 text-base">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                Where
              </p>
              <p className="mt-1 text-champagne">{venue.address.street}</p>
              <p className="text-sage">{venue.address.locality}</p>
              {venue.address.context && <p className="text-sm text-sage/80">{venue.address.context}</p>}
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                Hours
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {venue.hours.map((h) => (
                  <li key={h.label} className="flex justify-between gap-6 text-sage">
                    <span className="text-champagne/90">{h.label}</span>
                    <span>{h.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {venue.phone && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  Call
                </p>
                <a href={`tel:${venue.phone.replace(/[^\d+]/g, "")}`} className="mt-1 block text-champagne hover:text-gold">
                  {venue.phone}
                </a>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {venue.reservation && (
                <CTA href={venue.reservation.url} external variant="solid" analytics={{ event: "reservation_click", params: { venue: vp } }}>
                  Reserve
                </CTA>
              )}
              {venue.menuUrl && (
                <CTA href={venue.menuUrl} external variant="outline" analytics={{ event: "menu_click", params: { venue: vp } }}>
                  Menu
                </CTA>
              )}
              <CTA href={`https://www.google.com/maps/search/?api=1&query=${q}`} external variant="text" analytics={{ event: "directions_click", params: { venue: vp } }}>
                Directions
              </CTA>
            </div>

            {venue.delivery && venue.delivery.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  Order in
                </p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                  {venue.delivery.map((d) => (
                    <a key={d.label} href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-champagne underline underline-offset-4 decoration-champagne/40 hover:text-gold">
                      {d.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            {venue.socials && venue.socials.length > 0 && (
              <div className="pt-1">
                <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  Follow
                </p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                  {venue.socials.map((s) => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-champagne underline underline-offset-4 decoration-champagne/40 hover:text-gold">
                      {s.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Directions, links out to Google Maps (no third-party embed / cookies) */}
        <TrackedLink
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          event="directions_click"
          params={{ venue: vp }}
          className="group flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-sm border border-champagne/10 bg-forest p-8 text-center transition-colors hover:border-gold/40 md:aspect-auto md:min-h-[420px]"
        >
          <span className="eyebrow mb-1">Find the room</span>
          <span className="font-display text-2xl text-champagne md:text-3xl">{venue.address.street}</span>
          <span className="text-sm text-sage">{venue.address.locality}</span>
          <span className="mt-3 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-gold transition-colors group-hover:text-gold-light" style={{ fontFamily: "var(--font-label)" }}>
            Get directions <span aria-hidden="true">↗</span>
          </span>
        </TrackedLink>
      </div>
    </section>
  );
}
