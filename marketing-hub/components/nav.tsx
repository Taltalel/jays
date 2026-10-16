"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/spend", label: "Spend" },
  { href: "/integrations", label: "Integrations" },
];

/** Pages from later phases, listed so it's clear they're coming, not missing. */
const LATER = ["Campaigns", "Channels", "Email", "Social", "Events", "Partners", "Reviews", "Tracking"];

export function Nav({ email }: { email: string }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight">
          Marketing Hub
        </Link>
        <nav className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-sm ${
                active(l.href) ? "bg-panel-2 text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {LATER.map((l) => (
            <span key={l} title="Coming in a later phase" className="shrink-0 cursor-default px-2.5 py-1.5 text-sm text-dim/60">
              {l}
            </span>
          ))}
        </nav>
        <form action="/auth/signout" method="post" className="shrink-0">
          <button className="text-xs text-dim hover:text-fg" title={email}>
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
