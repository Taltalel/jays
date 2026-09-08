import type { Metadata } from "next";
import { Monogram } from "@/components/brand/Logo";
import { CTA } from "@/components/ui/CTA";

export const metadata: Metadata = {
  title: "Not found",
  description: "This room doesn't exist, but the good ones do.",
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] w-full items-center justify-center overflow-hidden px-6 py-32 text-center">
      <div className="relative z-10 flex flex-col items-center">
        <Monogram className="h-16 w-auto opacity-90" />
        <p className="eyebrow mt-8">Error 404</p>
        <h1 className="h1-hero mt-4 text-champagne">Wrong door.</h1>
        <p className="measure mt-5 text-base text-sage md:text-lg">
          This room isn&apos;t on the list, but three very good ones are. Let&apos;s get you back to the house.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <CTA href="/" variant="outline">
            Back to Room 7
          </CTA>
          <CTA href="/collection">See the collection</CTA>
        </div>
      </div>
    </section>
  );
}
