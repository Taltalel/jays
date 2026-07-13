import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  external?: boolean;
  variant?: "text" | "outline" | "solid";
  className?: string;
};

/** A gold-forward call to action. Text (default), outline, or solid. */
export function CTA({ href, children, external, variant = "text", className = "" }: Props) {
  const base =
    "group inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.15em] transition-colors";
  const styles = {
    text: "text-gold hover:text-gold-light",
    outline:
      "rounded-sm border border-gold/70 px-6 py-3 text-gold hover:bg-gold hover:text-forest-deep",
    solid: "rounded-sm bg-gold px-6 py-3 text-forest-deep hover:bg-gold-light",
  }[variant];

  const inner = (
    <>
      <span>{children}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
        →
      </span>
    </>
  );

  const cls = `${base} ${styles} ${className}`;
  const fontStyle = { fontFamily: "var(--font-label)" };

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={fontStyle}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} style={fontStyle}>
      {inner}
    </Link>
  );
}
