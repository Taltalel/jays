import Link from "next/link";
import { Monogram } from "@/components/brand/Logo";

/** "A Room 7 venue" mark — carried on every venue page. */
export function RoomMark() {
  return (
    <div className="border-t border-champagne/10 bg-forest-deep">
      <Link
        href="/"
        className="logo-link mx-auto flex max-w-7xl items-center justify-center gap-3 px-5 py-10 text-champagne/70 transition-colors hover:text-champagne md:px-8"
      >
        <Monogram className="h-6 w-6" />
        <span className="text-[11px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-label)" }}>
          A Room 7 venue
        </span>
      </Link>
    </div>
  );
}
