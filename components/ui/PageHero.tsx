import type { ReactNode } from "react";
import { Placeholder } from "@/components/ui/Placeholder";

type Tone = "night" | "riot" | "view" | "coast" | "church" | "beach";

/** Reusable interior-page hero: full-bleed placeholder, scrim, eyebrow/title. */
export function PageHero({
  eyebrow,
  title,
  sub,
  tone = "night",
  placeholder,
  image,
  imagePosition,
  children,
  short = false,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  tone?: Tone;
  placeholder: string;
  /** Real hero photograph; falls back to the gradient when absent. */
  image?: string;
  imagePosition?: string;
  children?: ReactNode;
  short?: boolean;
}) {
  return (
    <section className={`relative flex w-full items-end overflow-hidden ${short ? "min-h-[52vh]" : "min-h-[68vh]"}`}>
      <Placeholder
        tone={tone}
        label={placeholder}
        seed={title}
        src={image}
        alt={image ? title : undefined}
        objectPosition={imagePosition}
        priority
        showLabel={!image}
        className="absolute inset-0"
      />
      <div className="scrim absolute inset-0" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 md:px-8 md:pb-20">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="h1-hero max-w-4xl text-balance text-champagne">{title}</h1>
        {sub && <p className="measure mt-5 text-base text-champagne/85 md:text-lg">{sub}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
