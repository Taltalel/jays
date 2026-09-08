"use client";

import type { ReactNode } from "react";
import { track, type EventParams } from "@/lib/analytics";

/**
 * An external `<a>` that fires a GA event on click before navigating. Use for
 * outbound links inside server components (which can't attach onClick directly).
 * Styling/markup is caller-controlled so it's a drop-in for an existing anchor.
 */
export function TrackedLink({
  href,
  event,
  params,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  href: string;
  event: string;
  params?: EventParams;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
      onClick={() => track(event, params)}
    >
      {children}
    </a>
  );
}
