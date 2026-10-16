import Link from "next/link";
import type { ReactNode } from "react";
import { formatInstant, timeAgo } from "@/lib/time";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <div className="mt-1 text-sm text-muted">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, footer, className = "" }: { title?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-panel ${className}`}>
      {title && <div className="border-b border-line px-4 py-3 text-sm font-medium">{title}</div>}
      <div className="p-4">{children}</div>
      {footer && <div className="border-t border-line px-4 py-2 text-xs text-dim">{footer}</div>}
    </section>
  );
}

const TONES = {
  ok: "bg-ok/10 text-ok border-ok/30",
  warn: "bg-warn/10 text-warn border-warn/30",
  bad: "bg-bad/10 text-bad border-bad/30",
  info: "bg-info/10 text-info border-info/30",
  muted: "bg-panel-2 text-muted border-line",
} as const;

export type Tone = keyof typeof TONES;

export function Badge({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

/** Every number carries where it came from and when it was last synced. */
export function SourceNote({ source, syncedAt }: { source: string; syncedAt?: string | null }) {
  return (
    <span className="text-xs text-dim" title={syncedAt ? formatInstant(syncedAt) : undefined}>
      Source: {source}
      {syncedAt !== undefined && <> · last synced {timeAgo(syncedAt)}</>}
    </span>
  );
}

/** Empty states always say why they are empty. */
export function Empty({ title, reason, action }: { title: string; reason: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-4 py-8 text-center">
      <div className="text-sm font-medium">{title}</div>
      <div className="mx-auto mt-1 max-w-md text-sm text-muted">{reason}</div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ButtonLink({ href, children, variant = "secondary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <Link href={href} className={buttonClass(variant)}>
      {children}
    </Link>
  );
}

export function buttonClass(variant: "primary" | "secondary" | "danger" = "secondary") {
  const base = "inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50";
  if (variant === "primary") return `${base} bg-accent text-black hover:bg-white`;
  if (variant === "danger") return `${base} border border-bad/40 text-bad hover:bg-bad/10`;
  return `${base} border border-line bg-panel-2 text-fg hover:bg-line`;
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="tabular mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-dim">{sub}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${TONES[tone]}`}>{children}</div>;
}
