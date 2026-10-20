import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that govern your use of room7hospitality.com.",
  alternates: { canonical: "https://room7hospitality.com/terms/" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="July 2026"
      intro="These Terms of Use govern your access to and use of room7hospitality.com, operated by Room 7. By using the site you agree to these terms. If you do not agree, please do not use the site."
      sections={[
        {
          heading: "Using the site",
          body: [
            "This website is provided for general information about Room 7 and its venues, Jay's, Naked Taco and HIGHBAR. You may use it for lawful, personal, non-commercial purposes.",
            "You agree not to misuse the site, interfere with its operation, attempt to gain unauthorized access, scrape or harvest data, or use it in any way that violates applicable law or these terms.",
          ],
        },
        {
          heading: "Reservations & third-party services",
          body: [
            "Reservations, menus, gift cards, delivery and similar features link out to third-party services (such as OpenTable, delivery partners, and each venue's own website). Those services are provided by third parties under their own terms and privacy policies, and we are not responsible for them.",
            "Bookings, purchases and orders you make through those services are transactions between you and the applicable venue or provider.",
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            "The site and its content, including the Room 7 name, logos, text, design, and imagery, are owned by Room 7 or its venues and licensors and are protected by intellectual-property laws. You may not copy, reproduce, distribute, or create derivative works from any part of the site without our prior written permission.",
          ],
        },
        {
          heading: "Accuracy & availability",
          body: [
            "We work to keep information current, but hours, menus, pricing, availability and events change and may contain errors. Information on the site is provided “as is” without warranty. Confirm details directly with the venue before relying on them.",
            "We may modify, suspend, or discontinue any part of the site at any time without notice.",
          ],
        },
        {
          heading: "Disclaimers & limitation of liability",
          body: [
            "To the fullest extent permitted by law, Room 7 disclaims all warranties, express or implied, regarding the site. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, the site.",
          ],
        },
        {
          heading: "Indemnification",
          body: [
            "You agree to indemnify and hold harmless Room 7 and its venues, and their owners, officers and employees, from any claims or expenses arising out of your misuse of the site or violation of these terms.",
          ],
        },
        {
          heading: "Governing law",
          body: [
            "These terms are governed by the laws of the State of Florida, without regard to its conflict-of-laws rules. Any dispute will be brought in the state or federal courts located in Broward County, Florida.",
          ],
        },
        {
          heading: "Changes to these terms",
          body: [
            "We may update these terms from time to time. Changes take effect when posted, and the “last updated” date above will reflect the latest version. Your continued use of the site means you accept the updated terms.",
          ],
        },
      ]}
    />
  );
}
