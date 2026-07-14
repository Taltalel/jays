import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How room7hospitality.com uses cookies and similar technologies, and how to control them.",
  alternates: { canonical: "https://room7hospitality.com/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="July 2026"
      intro="This Cookie Policy explains how Room 7 uses cookies and similar technologies on room7hospitality.com. It should be read alongside our Privacy Policy."
      sections={[
        {
          heading: "What cookies are",
          body: [
            "Cookies are small text files placed on your device when you visit a website. They help the site work, remember your preferences, and understand how the site is used. We also use similar technologies such as pixels and local storage.",
          ],
        },
        {
          heading: "The cookies we use",
          body: [
            "Strictly necessary — required for the site to function, such as page navigation and security. These cannot be switched off in our systems.",
            "Analytics & performance — help us understand how visitors use the site so we can improve it (for example, Google Analytics). These collect information in aggregate.",
            "Functional — remember choices you make to give you a better experience.",
            "Third-party — some pages embed third-party content (such as maps or reservation widgets) that may set their own cookies under the provider's policy.",
          ],
        },
        {
          heading: "Managing cookies",
          body: [
            "You can control or delete cookies through your browser settings, and set most browsers to warn you before accepting cookies or to refuse them. Blocking some cookies may affect how parts of the site work.",
            "Where a cookie-consent banner is shown, you can also manage your preferences there. To opt out of Google Analytics specifically, you can install Google's opt-out browser add-on.",
          ],
        },
        {
          heading: "Changes to this policy",
          body: [
            "We may update this Cookie Policy as our practices or the technologies we use change. The “last updated” date above reflects the latest version.",
          ],
        },
      ]}
    />
  );
}
