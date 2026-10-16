"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { runGmailSync } from "@/lib/gmail/sync";
import { runHealthChecks } from "@/lib/integrations/checks";
import { errorMessage } from "@/lib/redact";

export async function checkNow() {
  await requireOwner({ onFail: "throw" });
  const results = await runHealthChecks();
  revalidatePath("/", "layout");
  const failed = results.filter((r) => !r.ok).length;
  redirect(`/integrations?ok=${encodeURIComponent(`Checked ${results.length} source(s)${failed ? `, ${failed} failing` : ", all passing"}.`)}`);
}

export async function syncGmailNow() {
  await requireOwner({ onFail: "throw" });
  let msg: string;
  try {
    const s = await runGmailSync();
    msg = `Gmail: scanned ${s.scanned}, booked ${s.booked}, needs review ${s.needsReview}, not receipts ${s.notReceipt}, duplicates ${s.duplicate}, errors ${s.errors}${s.remaining ? `, ${s.remaining} left for next run` : ""}.`;
  } catch (e) {
    redirect(`/integrations?error=${encodeURIComponent(`Gmail sync failed: ${errorMessage(e)}`)}`);
  }
  revalidatePath("/", "layout");
  redirect(`/integrations?ok=${encodeURIComponent(msg)}`);
}
