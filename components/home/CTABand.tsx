import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";

type Props = {
  eyebrow: string;
  headline: string;
  sub: string;
  cta: { label: string; href: string };
  tone: "night" | "riot" | "coast" | "view" | "church" | "beach";
  placeholder: string;
  /** Real background photo; falls back to the toned gradient when omitted. */
  image?: string;
  imagePosition?: string;
  align?: "left" | "center";
};

/** Wide image, one line, one CTA. Used for Private Events and Careers. */
export function CTABand({ eyebrow, headline, sub, cta, tone, placeholder, image, imagePosition, align = "left" }: Props) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[420px] w-full md:min-h-[520px]">
        <Placeholder tone={tone} label={placeholder} src={image} alt={image ? placeholder : undefined} objectPosition={imagePosition} showLabel={!image} className="absolute inset-0" seed={eyebrow} />
        <div className="scrim absolute inset-0" />
        <div
          className={`absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end px-5 py-14 md:px-8 md:py-20 ${
            align === "center" ? "items-center text-center" : "items-start"
          }`}
        >
          <Reveal className={align === "center" ? "flex flex-col items-center" : ""}>
            <p className="eyebrow mb-4">{eyebrow}</p>
            <h2 className="h2-display max-w-2xl text-balance text-champagne">{headline}</h2>
            <p className="measure mt-4 text-base text-champagne/85 md:text-lg">{sub}</p>
            <div className="mt-8">
              <CTA href={cta.href} variant="outline">
                {cta.label}
              </CTA>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
