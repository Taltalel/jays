import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { group } from "@/content/group";
import { venues } from "@/content/venues";

const explore = [
  { label: "The Collection", href: "/collection" },
  { label: "About", href: "/about" },
  { label: "Jay Shirodkar", href: "/about/jay-shirodkar" },
  { label: "Private Events", href: "/private-events" },
  { label: "Press", href: "/press" },
  { label: "Careers", href: "/careers" },
  { label: "Gift Cards", href: "/gift-cards" },
  { label: "Contact", href: "/contact" },
];

const legal = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="border-t border-champagne/10 bg-forest-deep">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Logo withTagline className="h-14 w-auto" />
            <p className="measure mt-6 text-sm leading-relaxed text-sage">
              Four rooms. One house. Elevated hospitality across South Florida — built by{" "}
              <a href={group.founder.site} target="_blank" rel="noopener noreferrer" className="text-champagne underline underline-offset-4 decoration-champagne/40 hover:text-gold">
                {group.founder.name}
              </a>
              .
            </p>
          </div>

          {/* The rooms */}
          <div className="md:col-span-3">
            <p className="eyebrow mb-4">The Rooms</p>
            <ul className="flex flex-col gap-2.5">
              {venues.map((v) => (
                <li key={v.slug}>
                  <Link
                    href={`/collection/${v.slug}`}
                    className="group inline-flex items-baseline gap-2 text-champagne/85 transition-colors hover:text-gold"
                  >
                    <span className="font-display text-lg">{v.name}</span>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
                      {v.nickname}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <p className="eyebrow mb-4">Explore</p>
            <ul className="flex flex-col gap-2.5">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-champagne/85 transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <p className="eyebrow mb-4">The House</p>
            <address className="flex flex-col gap-3 text-sm not-italic text-sage">
              <span>
                {group.hq.street}
                <br />
                {group.hq.locality}
              </span>
              <a href={`mailto:${group.email}`} className="text-champagne transition-colors hover:text-gold">
                {group.email}
              </a>
            </address>

            <p className="eyebrow mb-3 mt-8">Follow the rooms</p>
            <ul className="flex flex-col gap-2">
              {venues.map((v) => (
                <li key={v.slug}>
                  <a
                    href={v.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-baseline gap-2 text-sm text-champagne/85 transition-colors hover:text-gold"
                  >
                    <span>{v.instagram.handle}</span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
                      {v.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 rule-gold" />

        <div className="mt-6 flex flex-col gap-4 text-xs text-sage md:flex-row md:items-center md:justify-between">
          <p style={{ fontFamily: "var(--font-label)" }} className="uppercase tracking-[0.14em]">
            © {new Date().getFullYear()} {group.name} · {group.tagline}
          </p>
          <ul className="flex gap-6">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="uppercase tracking-[0.14em] transition-colors hover:text-gold" style={{ fontFamily: "var(--font-label)" }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
