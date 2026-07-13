import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Room 7 handles the information you share with us.",
  alternates: { canonical: "https://room7hospitality.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 2026"
      intro="Room 7 respects your privacy. This policy explains what we collect when you use room7hospitality.com or contact us, and what we do with it."
      sections={[
        {
          heading: "What we collect",
          body: [
            "Information you give us directly — your name, email, phone and message when you submit an inquiry, apply for a role, or join our newsletter.",
            "Basic usage data collected through analytics (such as Google Analytics) to understand how the site is used.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To respond to your inquiry, process an application, send you the newsletter you asked for, and improve the site.",
            "We do not sell your information.",
          ],
        },
        {
          heading: "Third parties",
          body: [
            "We use trusted services for reservations (OpenTable), email marketing (Klaviyo or Mailchimp) and analytics. Each handles data under its own policy.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "You can unsubscribe from our newsletter at any time, and request that we delete the information you've shared, by emailing us.",
          ],
        },
      ]}
    />
  );
}
