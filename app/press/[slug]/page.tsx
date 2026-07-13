import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { releases, releaseBySlug } from "@/content/press";
import { boilerplate, group } from "@/content/group";
import { newsArticleSchema } from "@/lib/schema";
import { CTA } from "@/components/ui/CTA";

export function generateStaticParams() {
  return releases.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = releaseBySlug(slug);
  if (!r) return {};
  return {
    title: r.title,
    description: r.dek,
    alternates: { canonical: `https://room7hospitality.com/press/${r.slug}` },
    openGraph: {
      type: "article",
      title: r.title,
      description: r.dek,
      publishedTime: r.date,
      images: [{ url: "/og/room7.png", width: 1200, height: 630, alt: "Room 7" }],
    },
  };
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function ReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = releaseBySlug(slug);
  if (!r) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema(r)) }}
      />
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <Link href="/press" className="text-[11px] uppercase tracking-[0.15em] text-gold hover:text-gold-light" style={{ fontFamily: "var(--font-label)" }}>
          ← Press
        </Link>

        <p className="mt-8 text-[11px] uppercase tracking-[0.15em] text-sage" style={{ fontFamily: "var(--font-label)" }}>
          {r.dateline} · {fmt(r.date)}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-champagne md:text-6xl">{r.title}</h1>
        <p className="measure mt-5 text-lg text-sage md:text-xl">{r.dek}</p>

        <span className="my-10 block rule-gold" aria-hidden="true" />

        <div className="measure flex flex-col gap-5 text-base leading-relaxed text-champagne/90 md:text-lg">
          {r.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Boilerplate on every release */}
        <div className="mt-14 border-t border-champagne/10 pt-8">
          <p className="text-[11px] uppercase tracking-[0.15em] text-gold" style={{ fontFamily: "var(--font-label)" }}>About Room 7</p>
          <p className="measure mt-3 text-sm leading-relaxed text-sage">{boilerplate}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="text-sm text-sage">Media: <a href={`mailto:${group.email}`} className="text-champagne hover:text-gold">{group.email}</a></span>
            <CTA href="/press">All press</CTA>
          </div>
        </div>
      </article>
    </>
  );
}
