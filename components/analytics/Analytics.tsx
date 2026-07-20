"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { GA_ENABLED, GA_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * GA4 loader. gtag.js loads `afterInteractive` so it never blocks first paint.
 * The initial page_view is sent by gtag config; subsequent App-Router client
 * navigations fire a manual page_view here (config alone doesn't see them).
 *
 * Renders nothing unless NEXT_PUBLIC_GA_ID is a real measurement id — set it in
 * the Vercel project env and redeploy to switch analytics on.
 */
export function Analytics() {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (!GA_ENABLED) return;
    // The first render's page_view is already sent by gtag('config', …).
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  if (!GA_ENABLED) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
