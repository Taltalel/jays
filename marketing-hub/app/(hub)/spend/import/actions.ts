"use server";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { formatCents } from "@/lib/money";
import { errorMessage } from "@/lib/redact";
import { importSeed } from "@/lib/spend/seed-import";
import { parseSeedWorkbook, type SheetReport } from "@/lib/spend/seed-parse";

const MAX_BYTES = 4 * 1024 * 1024;

export interface ImportState {
  error?: string;
  reports?: { name: string; report: SheetReport }[];
  summary?: string;
  imported?: string;
  canImport?: boolean;
}

/** Preview (no writes) or import the Jays-Marketing-Spend-Log.xlsx workbook. */
export async function importWorkbook(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose the .xlsx file first." };
  if (!file.name.toLowerCase().endsWith(".xlsx")) return { error: "That isn't an .xlsx file. In Excel or Google Sheets, download as .xlsx." };
  if (file.size > MAX_BYTES) return { error: "File is over 4 MB. Remove extra tabs or images and try again." };

  try {
    const data = await parseSeedWorkbook(await file.arrayBuffer());
    const reports = [
      { name: "Monthly Payments", report: data.reports.monthly },
      { name: "Outstanding — To Pay", report: data.reports.outstanding },
      { name: "Spend Log", report: data.reports.log },
    ];
    const net = data.transactions
      .filter((t) => t.status === "paid" || t.status === "refund")
      .reduce((s, t) => s + t.amount_cents, 0);
    const summary = `Found ${data.vendors.length} monthly payments, ${data.transactions.length} transactions (${formatCents(net)} paid, net of refunds) and ${data.payables.length} items to pay.`;
    const canImport = reports.some((r) => r.report.sheet);

    if (fd.get("intent") !== "import") return { reports, summary, canImport };

    const c = await importSeed(supabase, data);
    revalidatePath("/", "layout");
    return {
      reports,
      summary,
      canImport,
      imported: `Imported: ${c.vendorsCreated} new vendors (${c.vendorsUpdated} updated), ${c.transactionsInserted} new transactions, ${c.payablesInserted} new items to pay. Rows already in the Hub were left alone.`,
    };
  } catch (e) {
    return { error: `Couldn't read the workbook: ${errorMessage(e)}` };
  }
}
