import type { Tone } from "@/components/ui";

export function vendorStatusTone(s: string): Tone {
  if (s === "Active") return "ok";
  if (s === "Failing" || s === "Suspended") return "bad";
  if (s === "Duplicate") return "warn";
  return "muted";
}

export function txnStatusTone(s: string): Tone {
  if (s === "paid") return "ok";
  if (s === "failed") return "bad";
  if (s === "due") return "warn";
  return "info";
}

export function priorityTone(p: string): Tone {
  if (p === "Urgent") return "bad";
  if (p === "This week") return "warn";
  return "muted";
}

export const SOURCE_LABEL: Record<string, string> = {
  gmail: "Gmail",
  upload: "Upload",
  api: "API",
  manual: "Manual",
};
