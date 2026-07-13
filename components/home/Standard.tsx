import { Reveal } from "@/components/ui/Reveal";
import { theStandard } from "@/content/group";

/** "The standard" — our values, in Room 7's voice. Gold hairlines between. */
export function Standard() {
  return (
    <section className="border-y border-champagne/10 bg-forest/40">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal className="mb-12 max-w-2xl md:mb-16">
          <p className="eyebrow mb-3">The Standard</p>
          <h2 className="h2-display text-champagne">
            One house. One way of doing things.
          </h2>
        </Reveal>

        <ul className="flex flex-col">
          {theStandard.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 60}>
              {i > 0 && <span className="rule-gold mb-8 block md:mb-10" aria-hidden="true" />}
              <div className="grid gap-4 pb-8 md:grid-cols-12 md:gap-8 md:pb-10">
                <div className="flex items-baseline gap-4 md:col-span-5">
                  <span className="font-display text-xl text-gold/70">0{i + 1}</span>
                  <h3 className="font-display text-2xl text-champagne md:text-3xl">{v.title}</h3>
                </div>
                <p className="text-pretty text-base text-sage md:col-span-7 md:text-lg">{v.line}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
