import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How room7hospitality.com uses cookies.",
  alternates: { canonical: "https://room7hospitality.com/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="July 2026"
      intro="This site uses a small number of cookies to function and to help us understand how it's used."
      sections={[
        {
          heading: "What cookies we use",
          body: [
            "Essential cookies that let the site work as intended.",
            "Analytics cookies (such as Google Analytics) that help us see which pages are useful, always in aggregate.",
          ],
        },
        {
          heading: "Managing cookies",
          body: [
            "You can control or delete cookies through your browser settings. Blocking some may affect how parts of the site behave.",
          ],
        },
      ]}
    />
  );
}
