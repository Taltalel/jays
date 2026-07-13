import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { RolesBrowser } from "@/components/careers/RolesBrowser";
import { InquiryForm, type Field } from "@/components/ui/InquiryForm";
import { whyRoom7Careers } from "@/content/careers";
import { group } from "@/content/group";

export const metadata: Metadata = {
  title: "Careers — Join the house",
  description:
    "Open roles across Room 7's four rooms in Fort Lauderdale and Miami Beach. We hire for warmth first and teach the rest.",
  alternates: { canonical: "https://room7hospitality.com/careers" },
};

const fields: Field[] = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "role", label: "Role of interest", type: "text" },
  { name: "venue", label: "Which room", type: "select", options: ["Jay's", "Naked Taco", "HighBar", "Riviera", "The Group", "Open to any"] },
  { name: "portfolio", label: "Resume / LinkedIn (URL)", type: "text" },
  { name: "message", label: "Tell us about you", type: "textarea", full: true },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Join the house."
        sub="We hire for warmth first and teach the rest. If you make rooms feel good, there's a seat for you."
        tone="riot"
        placeholder="The team, working — real people, mid-service"
      />

      {/* Why Room 7 */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {whyRoom7Careers.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 50}>
              <h3 className="font-display text-2xl text-champagne">{w.title}</h3>
              <span className="mt-3 block h-px w-14 bg-gold/50" aria-hidden="true" />
              <p className="mt-3 text-base text-sage">{w.line}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section className="border-y border-champagne/10 bg-forest/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal className="mb-8">
            <p className="eyebrow mb-3">Open Roles</p>
            <h2 className="h2-display text-champagne">Find your room.</h2>
          </Reveal>
          <Reveal>
            <RolesBrowser />
          </Reveal>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="border-t border-champagne/10 bg-forest-deep scroll-mt-24">
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          <Reveal className="mb-10 text-center">
            <p className="eyebrow mb-3">Apply</p>
            <h2 className="h2-display text-champagne">Introduce yourself.</h2>
            <p className="measure mx-auto mt-4 text-base text-sage">
              Applying for a role or just want us to know you exist — both work. We read everything.
            </p>
          </Reveal>
          <InquiryForm
            fields={fields}
            inbox={group.email}
            subject="Careers application — Room 7"
            submitLabel="Send application"
            confirm="Thank you — we've got it. If there's a fit, you'll hear from us."
          />
        </div>
      </section>
    </>
  );
}
