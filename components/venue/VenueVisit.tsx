import { CTA } from "@/components/ui/CTA";
import type { Venue } from "@/content/venues";

/** VISIT — address, hours, phone, map, reserve. */
export function VenueVisit({ venue }: { venue: Venue }) {
  const q = encodeURIComponent(`${venue.name}, ${venue.address.street}, ${venue.address.locality}`);
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
                <CTA href={venue.reservation.url} external variant="solid">
                  Reserve
                </CTA>
              )}
              {venue.menuUrl && (
                <CTA href={venue.menuUrl} external variant="outline">
                  Menu
                </CTA>
              )}
              <CTA href={`https://www.google.com/maps/search/?api=1&query=${q}`} external variant="text">
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

        {/* Real map — Google Maps embed, no API key required */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-champagne/10 bg-forest md:aspect-auto md:min-h-[420px]">
          <iframe
            title={`Map — ${venue.name}`}
            src={`https://www.google.com/maps?q=${q}&output=embed`}
            className="absolute inset-0 h-full w-full grayscale-[0.2]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
