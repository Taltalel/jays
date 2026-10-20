import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { Importer } from "./importer";

export const maxDuration = 300;

export default async function ImportPage() {
  await requireOwner();
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Import spreadsheet"
        subtitle={
          <Link href="/spend" className="hover:text-fg">
            ← Spend
          </Link>
        }
      />
      <Importer />
    </div>
  );
}
