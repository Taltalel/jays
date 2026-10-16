import Link from "next/link";
import { Notice, PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { hasEnv } from "@/lib/env";
import { Uploader } from "./uploader";

export const maxDuration = 120;

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireOwner();
  const { error } = await searchParams;
  const aiReady = hasEnv("ANTHROPIC_API_KEY");

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Upload receipt"
        subtitle={
          <Link href="/spend" className="hover:text-fg">
            ← Spend
          </Link>
        }
      />
      {error && <Notice tone="bad">{error}</Notice>}
      {aiReady ? (
        <Uploader />
      ) : (
        <Notice tone="warn">
          AI parsing isn&apos;t connected: ANTHROPIC_API_KEY is missing. Add it in Vercel (see{" "}
          <Link href="/integrations" className="underline">
            Integrations
          </Link>
          ), or use “Add expense” on the Spend Log for now.
        </Notice>
      )}
    </div>
  );
}
