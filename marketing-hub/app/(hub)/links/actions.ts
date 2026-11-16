"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { ATTRIBUTION_CHANNELS, CHANNEL_PRESETS, isValidCode, suggestCode } from "@/lib/links/core";

function str(fd: FormData, k: string, max = 200): string | null {
  const v = fd.get(k);
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t === "" ? null : t;
}

const tag = (s: string | null) =>
  s
    ? s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || null
    : null;

function back(params: Record<string, string>): never {
  redirect(`/links?${new URLSearchParams(params)}`);
}

export async function createLink(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const channel = str(fd, "channel") ?? "Other";
  if (!(ATTRIBUTION_CHANNELS as readonly string[]).includes(channel)) back({ error: "Pick a channel." });
  const preset = CHANNEL_PRESETS[channel] ?? CHANNEL_PRESETS.Other;

  const label = str(fd, "label", 120);
  if (!label) back({ error: "Give the link a name, e.g. “Omakase email Oct 22”." });

  const destination = str(fd, "destination_custom", 1000) ?? str(fd, "destination", 1000);
  if (!destination || !/^https:\/\//.test(destination)) back({ error: "Destination must be a full https:// link." });
  try {
    new URL(destination);
  } catch {
    back({ error: "Destination isn't a valid link." });
  }

  const code = (str(fd, "code", 48) ?? suggestCode(preset.codePrefix, label)).toLowerCase();
  if (!isValidCode(code)) back({ error: "Code: lowercase letters, numbers and dashes only (e.g. email-omakase-oct22)." });

  const { error } = await supabase.from("tracked_links").insert({
    code,
    label,
    channel,
    utm_source: tag(str(fd, "utm_source")) ?? preset.source,
    utm_medium: tag(str(fd, "utm_medium")) ?? preset.medium,
    utm_campaign: tag(str(fd, "utm_campaign")) ?? tag(label),
    utm_content: tag(str(fd, "utm_content")),
    destination,
    placement: str(fd, "placement", 200),
  });
  if (error) {
    back({ error: /duplicate|unique/i.test(error.message) ? `The code “${code}” is taken. Choose another.` : error.message });
  }
  revalidatePath("/links");
  back({ ok: `Link ready: ${code}`, new: code });
}

export async function updateLink(fd: FormData) {
  const { supabase } = await requireOwner({ onFail: "throw" });
  const id = str(fd, "id");
  const destination = str(fd, "destination", 1000);
  if (!id) back({ error: "Missing link." });
  if (destination && !/^https:\/\//.test(destination)) back({ error: "Destination must start with https://" });
  const { error } = await supabase
    .from("tracked_links")
    .update({
      label: str(fd, "label", 120) ?? undefined,
      destination: destination ?? undefined,
      placement: str(fd, "placement", 200),
      active: fd.get("active") === "on",
    })
    .eq("id", id);
  if (error) back({ error: error.message });
  revalidatePath("/links");
  back({ ok: "Saved." });
}
