import Link from "next/link";
import { Badge, ButtonLink, Notice, PageHeader, SourceNote } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getReviewQueue, lastSync } from "@/lib/spend/queries";
import { BudgetsTab } from "./tabs/budgets";
import { LogTab } from "./tabs/log";
import { MonthlyTab } from "./tabs/monthly";
import { OutstandingTab } from "./tabs/outstanding";

const TABS = [
  { key: "monthly", label: "Monthly Payments" },
  { key: "outstanding", label: "Outstanding — To Pay" },
  { key: "log", label: "Spend Log" },
  { key: "budgets", label: "Budgets" },
] as const;

type SP = Record<string, string | undefined>;

export default async function SpendPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { supabase } = await requireOwner();
  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? sp.tab! : "monthly";

  const [gmailRun, seedRun, review] = await Promise.all([
    lastSync(supabase, "gmail"),
    lastSync(supabase, "seed"),
    getReviewQueue(supabase),
  ]);

  return (
    <>
      <PageHeader
        title="Spend"
        subtitle={
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            <SourceNote source="Gmail receipts" syncedAt={gmailRun?.finished_at ?? null} />
            <SourceNote source="Spend Log spreadsheet import" syncedAt={seedRun?.finished_at ?? null} />
          </span>
        }
        actions={
          <>
            {review.length > 0 && (
              <ButtonLink href="/spend/review">
                Needs review <Badge tone="warn">{review.length}</Badge>
              </ButtonLink>
            )}
            <ButtonLink href="/spend/import">Import spreadsheet</ButtonLink>
            <ButtonLink href="/spend/upload">Upload receipt</ButtonLink>
            <ButtonLink href="/spend?tab=log&add=1#add" variant="primary">
              Add expense
            </ButtonLink>
          </>
        }
      />

      {sp.error && <Notice tone="bad">{sp.error}</Notice>}
      {sp.ok && <Notice tone="ok">{sp.ok}</Notice>}

      <div className="-mx-4 mb-5 overflow-x-auto px-4">
        <div className="flex w-max gap-1 rounded-lg border border-line bg-panel p-1">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/spend?tab=${t.key}`}
              className={`rounded-md px-3 py-1.5 text-sm ${tab === t.key ? "bg-panel-2 text-fg" : "text-muted hover:text-fg"}`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {tab === "monthly" && <MonthlyTab db={supabase} year={sp.year} />}
      {tab === "outstanding" && <OutstandingTab db={supabase} show={sp.show} />}
      {tab === "log" && <LogTab db={supabase} sp={sp} />}
      {tab === "budgets" && <BudgetsTab db={supabase} month={sp.month} />}
    </>
  );
}
