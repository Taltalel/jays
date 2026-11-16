"use client";
import { useMemo, useState } from "react";
import { buttonClass } from "@/components/ui";
import {
  ATTRIBUTION_CHANNELS,
  buildDestination,
  CHANNEL_PRESETS,
  DESTINATION_PRESETS,
  isValidCode,
  shortUrl,
  suggestCode,
} from "@/lib/links/core";
import { createLink } from "./actions";

/** Only channels a guest can click from (not Phone / Walk-in / OpenTable network). */
const LINK_CHANNELS = ATTRIBUTION_CHANNELS.filter((c) => c in CHANNEL_PRESETS);

export function LinkBuilder({ base }: { base: string }) {
  const [channel, setChannel] = useState<string>("Email");
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  const [dest, setDest] = useState<string>(DESTINATION_PRESETS[0].url);
  const [custom, setCustom] = useState("");

  const preset = CHANNEL_PRESETS[channel] ?? CHANNEL_PRESETS.Other;
  const finalCode = (code || suggestCode(preset.codePrefix, label)).toLowerCase();
  const destination = dest || custom;

  const preview = useMemo(() => {
    if (!destination || !/^https:\/\//.test(destination)) return null;
    try {
      return buildDestination({
        code: finalCode,
        utm_source: preset.source,
        utm_medium: preset.medium,
        utm_campaign: label ? label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : null,
        utm_content: null,
        destination,
      });
    } catch {
      return null;
    }
  }, [destination, finalCode, label, preset]);

  return (
    <form action={createLink} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
        <div>
          <label>Channel</label>
          <select name="channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
            {LINK_CHANNELS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Name *</label>
          <input
            name="label"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={channel === "SMS" ? "VIP text Nov 20" : channel === "Email" ? "Omakase email Oct 22" : "Holiday story"}
          />
        </div>
        <div>
          <label>Sends guests to</label>
          <select name="destination" value={dest} onChange={(e) => setDest(e.target.value)}>
            {DESTINATION_PRESETS.map((d) => (
              <option key={d.key} value={d.url}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        {!dest && (
          <div>
            <label>Paste the link (https://…)</label>
            <input
              name="destination_custom"
              inputMode="url"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="https://www.eventbrite.com/e/…"
            />
          </div>
        )}
        <div>
          <label>Short code (optional)</label>
          <input name="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder={finalCode || "auto"} />
        </div>
        <div>
          <label>Where it will be used (optional)</label>
          <input name="placement" placeholder="e.g. Mailchimp campaign, story link sticker, flyer" />
        </div>
      </div>

      <div className="rounded-lg border border-line bg-panel-2 p-3 text-xs [overflow-wrap:anywhere]">
        <div className="text-muted">Guests will use</div>
        <div className={`mt-0.5 text-sm ${isValidCode(finalCode) ? "text-fg" : "text-bad"}`}>
          {finalCode ? shortUrl(base, finalCode) : "—"}
        </div>
        <div className="mt-2 text-muted">…and land on</div>
        <div className="mt-0.5 text-dim">{preview ?? "Choose where it sends guests"}</div>
      </div>

      <div className="flex justify-end">
        <button className={buttonClass("primary")} disabled={!isValidCode(finalCode) || !preview}>
          Create link
        </button>
      </div>
    </form>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-fg"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          window.prompt("Copy this link:", text);
        }
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}
