"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { parseEventbrite, parseOpenTable, readTable, type ImportPreview } from "@/lib/bookings/core";
import { getLinkRefs } from "@/lib/bookings/data";
import { ATTRIBUTION_CHANNELS } from "@/lib/links/core";
import { errorMessage } from "@/lib/redact";
import { isIsoDate, monthStart, nyDate } from "@/lib/time";

export interface BookingImportState {
  error?: string;
  preview?: {
    platform: string;
    mapped: Record<string, string>;
    total: number;
    matchedToLink: number;
    byChannel: Record<string, number>;
    unattributed: number;
    skipped: { row: number; reason: string }[];
  };
  imported?: string;
}

const MAX_BYTES = 4 * 1024 * 1024;

export async function importBookings(_prev: BookingImportState, fd: FormData): Promise<BookingImportState> {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const file = fd.get("file");
  const platform = fd.get("platform");
  const month = String(fd.get("month") ?? "").slice(0, 7) || nyDate().slice(0, 7);
  if (!(file instanceof File) || file.size === 0) return { error: "Choose the exported file first." };
  if (file.size > MAX_BYTES) return { error: "File is over 4 MB. Export a shorter date range." };
  if (!/\.(csv|xlsx)$/i.test(file.name)) return { error: "Use the CSV or .xlsx export." };
  if (platform !== "opentable" && platform !== "eventbrite") return { error: "Pick OpenTable or Eventbrite." };
  if (platform === "eventbrite" && !/^\d{4}-\d{2}$/.test(month)) return { error: "Pick the month the report covers." };

  try {
    const table = await readTable(file.name, await file.arrayBuffer());
    if (!table.headers.length) return { error: "Couldn't find a header row in that file." };
    const links = await getLinkRefs(supabase);
    const parsed: ImportPreview =
      platform === "opentable" ? parseOpenTable(table, links) : parseEventbrite(table, links, month);

    const byChannel: Record<string, number> = {};
    for (const r of parsed.rows) if (r.channel) byChannel[r.channel] = (byChannel[r.channel] ?? 0) + r.quantity;
    const preview = {
      platform,
      mapped: parsed.mapped,
      total: parsed.rows.reduce((s, r) => s + r.quantity, 0),
      matchedToLink: parsed.rows.filter((r) => r.how === "link").reduce((s, r) => s + r.quantity, 0),
      byChannel,
      unattributed: parsed.rows.filter((r) => !r.channel).reduce((s, r) => s + r.quantity, 0),
      skipped: parsed.skipped,
    };
    if (!parsed.rows.length) return { preview, error: "No bookings found — check the columns above." };
    if (fd.get("intent") !== "import") return { preview };

    // Rows are keyed by import_key, so a re-import updates instead of duplicating:
    // OpenTable rows are per reservation (a later export refreshes status, e.g.
    // cancelled); Eventbrite rows are per link per event per month (totals replace).
    const unique = [...new Map(parsed.rows.map((r) => [r.import_key, r])).values()];
    let written = 0;
    for (let i = 0; i < unique.length; i += 500) {
      const chunk = unique.slice(i, i + 500);
      const { data, error } = await supabase
        .from("bookings")
        .upsert(chunk, { onConflict: "import_key", ignoreDuplicates: false })
        .select("id");
      if (error) throw new Error(error.message);
      written += data?.length ?? 0;
    }
    revalidatePath("/bookings");
    return {
      preview,
      imported: `Saved ${written} ${platform === "opentable" ? "reservations" : "tracking-link rows"}. Re-importing the same file never double counts.`,
    };
  } catch (e) {
    return { error: `Couldn't read that file: ${errorMessage(e)}` };
  }
}

/** Host stand / offer code / phone tallies: "3 tables said Instagram tonight". */
export async function addTally(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const channel = String(fd.get("channel") ?? "");
  const date = String(fd.get("date") ?? "");
  const count = Math.round(Number(fd.get("count")));
  const covers = fd.get("covers") ? Math.round(Number(fd.get("covers"))) : null;
  const how = fd.get("how") === "offer_code" ? "offer_code" : "host_stand";
  const kind = channel === "Phone" ? "phone" : channel === "Walk-in" ? "walk_in" : "reservation";
  const back = (p: Record<string, string>) => redirect(`/bookings?month=${(isIsoDate(date) ? date : nyDate()).slice(0, 7)}&${new URLSearchParams(p)}`);

  if (!(ATTRIBUTION_CHANNELS as readonly string[]).includes(channel)) back({ error: "Pick a channel." });
  if (!isIsoDate(date)) back({ error: "Pick a date." });
  if (!Number.isFinite(count) || count < 1 || count > 500) back({ error: "Count must be 1–500." });

  const note = String(fd.get("note") ?? "").trim().slice(0, 200) || null;
  const { error } = await supabase.from("bookings").insert({
    platform: "manual",
    booked_on: date,
    kind,
    quantity: count,
    covers: covers && covers > 0 ? covers : null,
    status: "booked",
    channel,
    how,
    source_label: how === "offer_code" ? `Offer code${note ? `: ${note}` : ""}` : "Host stand",
    note,
    import_key: `manual:${randomUUID()}`,
  });
  if (error) back({ error: error.message });
  revalidatePath("/bookings");
  back({ ok: `Added ${count} for ${channel}.` });
}

export async function deleteTally(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const id = String(fd.get("id") ?? "");
  const month = String(fd.get("month") ?? monthStart(nyDate()).slice(0, 7));
  await supabase.from("bookings").delete().eq("id", id).eq("platform", "manual");
  revalidatePath("/bookings");
  redirect(`/bookings?month=${month}&ok=Removed.`);
}
