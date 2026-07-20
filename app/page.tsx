import { Hero } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { Collection } from "@/components/home/Collection";
import { Standard } from "@/components/home/Standard";
import { Founder } from "@/components/home/Founder";
import { PressStrip } from "@/components/home/PressStrip";
import { CTABand } from "@/components/home/CTABand";
import { InstagramFeed } from "@/components/home/InstagramFeed";
import { Newsletter } from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <Collection />
      <Standard />
      <Founder />
      <PressStrip />

      <CTABand
        eyebrow="Private Events"
        headline="Take the whole room."
        sub="Buyouts, private dining and the kind of party people cancel other plans for. Tell us the night; we'll build it."
        cta={{ label: "Plan an event", href: "/private-events" }}
        tone="night"
        placeholder="A full room mid-party — buyout energy"
      />

      <CTABand
        eyebrow="Careers"
        headline="Join the house."
        sub="We hire for warmth first and teach the rest. If you make rooms feel good, there is a seat for you."
        cta={{ label: "See open roles", href: "/careers" }}
        tone="riot"
        placeholder="The team, working — real people, mid-service"
        align="center"
      />

      <InstagramFeed />
      <Newsletter />
    </>
  );
}
