import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms for using room7hospitality.com.",
  alternates: { canonical: "https://room7hospitality.com/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="July 2026"
      intro="By using room7hospitality.com you agree to these terms. They're straightforward — a few notes on how to use the site."
      sections={[
        {
          heading: "Using the site",
          body: [
            "This site is provided for information about Room 7 and its venues. Reservations, menus and gift cards may link out to third-party services with their own terms.",
            "Please don't misuse the site, attempt to disrupt it, or use it for anything unlawful.",
          ],
        },
        {
          heading: "Content & marks",
          body: [
            "All content, branding and imagery on this site belong to Room 7 or its venues unless otherwise noted, and may not be reused without permission.",
          ],
        },
        {
          heading: "No warranty",
          body: [
            "We work to keep information accurate, but hours, menus and availability change. Confirm details with the venue before you visit.",
          ],
        },
      ]}
    />
  );
}
