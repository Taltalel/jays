"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo, Monogram } from "@/components/brand/Logo";
import { primaryNav, reserveLinks } from "@/content/nav";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-500 ${
        scrolled
          ? "bg-forest-deep/95 shadow-[0_1px_0_0_rgba(198,162,76,0.15)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between px-5 md:px-8">
        {/* Logo — full lockup, collapses to monogram when scrolled */}
        <Link href="/" className="logo-link relative flex items-center" aria-label="Room 7 — home">
          <Logo
            withTagline
            className={`h-11 w-auto transition-all duration-500 ${
              scrolled ? "pointer-events-none absolute opacity-0" : "opacity-100"
            }`}
          />
          <Monogram
            className={`h-9 w-9 transition-all duration-500 ${
              scrolled ? "opacity-100" : "pointer-events-none absolute opacity-0"
            }`}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {primaryNav.map((item) =>
            item.children ? (
              <Dropdown key={item.label} item={item} />
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="nav-link text-[13px] uppercase tracking-[0.15em] text-champagne/85 transition-colors hover:text-gold"
                style={{ fontFamily: "var(--font-label)" }}
              >
                {item.label}
              </Link>
            ),
          )}
          <ReserveButton />
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          className="flex items-center gap-2 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span className="relative block h-4 w-6" aria-hidden="true">
            <span
              className={`absolute left-0 block h-px w-6 bg-champagne transition-all duration-300 ${
                menuOpen ? "top-2 rotate-45" : "top-0.5"
              }`}
            />
            <span
              className={`absolute left-0 top-2 block h-px w-6 bg-champagne transition-all duration-300 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-6 bg-champagne transition-all duration-300 ${
                menuOpen ? "top-2 -rotate-45" : "top-3.5"
              }`}
            />
          </span>
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

/* ---------------------------------------------------------------- Dropdown */

function Dropdown({ item }: { item: (typeof primaryNav)[number] }) {
  return (
    <div className="group relative">
      <Link
        href={item.href}
        className="nav-link flex items-center gap-1.5 text-[13px] uppercase tracking-[0.15em] text-champagne/85 transition-colors group-hover:text-gold"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {item.label}
        <Caret />
      </Link>
      <div className="invisible absolute left-1/2 top-full min-w-[220px] -translate-x-1/2 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <ul className="overflow-hidden rounded-sm border border-gold/15 bg-forest/95 py-2 shadow-2xl backdrop-blur-md">
          {item.children!.map((child) => (
            <li key={child.label}>
              <Link
                href={child.href}
                className="flex flex-col gap-0.5 px-5 py-2.5 transition-colors hover:bg-emerald/60"
              >
                <span className="font-display text-lg text-champagne">{child.label}</span>
                {child.sublabel && (
                  <span
                    className="text-[10px] uppercase tracking-[0.15em] text-sage"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    {child.sublabel}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReserveButton() {
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-sm border border-gold/70 px-5 py-2.5 text-[12px] uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-forest-deep"
        style={{ fontFamily: "var(--font-label)" }}
      >
        Reserve
        <Caret />
      </button>
      <div className="invisible absolute right-0 top-full min-w-[240px] pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <ul className="overflow-hidden rounded-sm border border-gold/15 bg-forest/95 py-2 shadow-2xl backdrop-blur-md">
          {reserveLinks.map((r) => (
            <li key={r.label}>
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-0.5 px-5 py-2.5 transition-colors hover:bg-emerald/60"
              >
                <span className="font-display text-lg text-champagne">{r.label}</span>
                <span
                  className="text-[10px] uppercase tracking-[0.15em] text-sage"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {r.sublabel} · OpenTable ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Mobile menu */

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      id="mobile-menu"
      className={`fixed inset-0 top-[var(--header-h)] z-40 overflow-y-auto bg-forest-deep px-6 pb-16 pt-8 transition-all duration-500 lg:hidden ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <nav aria-label="Mobile" className="flex flex-col gap-1">
        {primaryNav.map((item) => (
          <div key={item.label} className="border-b border-champagne/10 py-4">
            <Link
              href={item.href}
              onClick={onClose}
              className="font-display text-3xl text-champagne"
            >
              {item.label}
            </Link>
            {item.children && (
              <ul className="mt-3 flex flex-col gap-2 pl-1">
                {item.children.map((c) => (
                  <li key={c.label}>
                    <Link
                      href={c.href}
                      onClick={onClose}
                      className="text-sm uppercase tracking-[0.15em] text-sage"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      {c.label}
                      {c.sublabel ? ` — ${c.sublabel}` : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-8">
        <p className="eyebrow mb-3">Reserve</p>
        <div className="flex flex-col gap-2">
          {reserveLinks.map((r) => (
            <a
              key={r.label}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-sm border border-gold/40 px-4 py-3"
            >
              <span className="font-display text-xl text-champagne">{r.label}</span>
              <span className="text-xs uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>
                Book ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Caret() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="mt-0.5 opacity-70">
      <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
