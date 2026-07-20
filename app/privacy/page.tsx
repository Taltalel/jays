import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Room 7 collects, uses, shares and protects the information you share with us.",
  alternates: { canonical: "https://room7hospitality.com/privacy/" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 2026"
      intro="Room 7 (“Room 7,” “we,” “us”) operates room7hospitality.com and the venues Jay's, Naked Taco, HighBar and Riviera. This policy explains what personal information we collect through this website, how we use and share it, and the choices you have. It applies to this website; our venues' own websites and the third-party services we link to have their own policies."
      sections={[
        {
          heading: "Information we collect",
          body: [
            "Information you give us directly — your name, email address, phone number, event or reservation details, and anything you include when you submit an inquiry, apply for a role, or sign up for our newsletter.",
            "Information collected automatically — when you visit the site we and our analytics providers may collect your IP address, device and browser type, pages viewed, referring pages, and similar usage data through cookies and comparable technologies (see our Cookie Policy).",
            "We do not intentionally collect sensitive information through this site, and we do not process payments here — reservations, gift cards and delivery are handled by the third-party services linked from each venue.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "To respond to your inquiries, process private-event and reservation requests, review job applications, and send you the newsletter you asked for.",
            "To operate, secure, analyze and improve the website, and to understand which content is useful.",
            "To comply with legal obligations and enforce our terms.",
          ],
        },
        {
          heading: "How we share it",
          body: [
            "With service providers who act on our behalf — for example our website host, the form-submission service that delivers your inquiries to us (currently FormSubmit), email/marketing platforms (such as Klaviyo or Mailchimp), analytics (such as Google Analytics), and reservation systems (OpenTable) — under terms that limit their use of the data.",
            "With the specific Room 7 venue relevant to your request, so it can respond to you.",
            "When required by law, to protect our rights or safety, or in connection with a business transfer.",
            "We do not sell your personal information, and we do not share it for cross-context behavioral advertising, as those terms are defined under California law.",
          ],
        },
        {
          heading: "Cookies & analytics",
          body: [
            "We use cookies and similar technologies to run the site and measure its use. You can control cookies through your browser and, where offered, through any consent banner. See our Cookie Policy for details.",
          ],
        },
        {
          heading: "Data retention",
          body: [
            "We keep personal information only as long as needed for the purposes above — to answer your inquiry, maintain our records, and meet legal requirements — after which we delete or de-identify it.",
          ],
        },
        {
          heading: "Your choices & rights",
          body: [
            "You can unsubscribe from marketing emails at any time using the link in any message, or by contacting us.",
            "Depending on where you live (for example, under the California Consumer Privacy Act or the GDPR), you may have the right to access, correct, delete, or port your personal information, and to opt out of certain sharing. To exercise these rights, email us and we will respond as required by applicable law. We will not discriminate against you for exercising them.",
          ],
        },
        {
          heading: "Children's privacy",
          body: [
            "This website is intended for adults and is not directed to children under 13, and we do not knowingly collect their personal information. If you believe a child has provided information, contact us and we will delete it.",
          ],
        },
        {
          heading: "Security",
          body: [
            "We use reasonable administrative, technical and physical safeguards to protect personal information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
          ],
        },
        {
          heading: "Third-party links",
          body: [
            "The site links to our venues' websites and third-party services (reservations, delivery, gift cards, social media). We are not responsible for their content or privacy practices; review their policies before using them.",
          ],
        },
        {
          heading: "Changes to this policy",
          body: [
            "We may update this policy from time to time. We will revise the “last updated” date above, and significant changes will be posted on this page.",
          ],
        },
      ]}
    />
  );
}
