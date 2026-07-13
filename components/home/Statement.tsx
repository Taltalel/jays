import { Reveal } from "@/components/ui/Reveal";
import { homeStatement, manifesto } from "@/content/group";

/** The statement — short, centred, generous whitespace. */
export function Statement() {
  return (
    <section id="statement" className="mx-auto max-w-4xl px-6 py-28 text-center md:py-40">
      <Reveal>
        <p className="eyebrow mb-8">Four rooms. One house.</p>
      </Reveal>
      <Reveal delay={80}>
        <p className="font-display text-balance text-[28px] leading-[1.3] text-champagne md:text-[40px] md:leading-[1.25]">
          {manifesto.hook}
        </p>
      </Reveal>
      <Reveal delay={160}>
        <p className="measure mx-auto mt-8 text-pretty text-base text-sage md:text-lg">
          {homeStatement}
        </p>
      </Reveal>
    </section>
  );
}
