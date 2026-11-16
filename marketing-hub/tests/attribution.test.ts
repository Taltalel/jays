import assert from "node:assert/strict";
import { test } from "node:test";
import { attribute, buildReport, parseCsv, parseEventbrite, parseOpenTable, toIsoDate } from "@/lib/bookings/core";
import { buildDestination, deviceClass, isBot, isValidCode, shortUrl, suggestCode } from "@/lib/links/core";

const links = [
  { id: "L1", code: "ig-bio", channel: "Instagram" },
  { id: "L2", code: "email-omakase-oct22", channel: "Email" },
  { id: "L3", code: "email", channel: "Email" },
  { id: "L4", code: "sms-nov20", channel: "SMS" },
];

test("destination gets UTM tags; Eventbrite also gets aff=code", () => {
  const ot = new URL(
    buildDestination({
      code: "ig-bio",
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "bio",
      utm_content: null,
      destination: "https://www.opentable.com/restref/client/?restref=1426036",
    }),
  );
  assert.equal(ot.searchParams.get("restref"), "1426036");
  assert.equal(ot.searchParams.get("utm_source"), "instagram");
  assert.equal(ot.searchParams.get("utm_content"), "ig-bio");
  assert.equal(ot.searchParams.get("aff"), null);

  const eb = new URL(
    buildDestination({
      code: "sms-nov20",
      utm_source: "sms",
      utm_medium: "sms",
      utm_campaign: null,
      utm_content: null,
      destination: "https://www.eventbrite.com/e/halloween-at-jays-123?utm_source=keep",
    }),
  );
  assert.equal(eb.searchParams.get("aff"), "sms-nov20");
  assert.equal(eb.searchParams.get("utm_source"), "keep", "existing tags are not overwritten");
});

test("link previews and crawlers are not counted as people", () => {
  assert.equal(isBot("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"), true);
  assert.equal(isBot("WhatsApp/2.23.20.0"), true);
  assert.equal(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)"), true);
  assert.equal(isBot(null), true);
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 300.0";
  assert.equal(isBot(iphone), false);
  assert.equal(deviceClass(iphone), "mobile");
});

test("short URLs and codes", () => {
  assert.equal(shortUrl("https://go.jaysfortlauderdale.com", "ig-bio"), "https://go.jaysfortlauderdale.com/ig-bio");
  assert.equal(shortUrl("https://tal-marketing-hub.vercel.app/", "ig-bio"), "https://tal-marketing-hub.vercel.app/go/ig-bio");
  assert.equal(suggestCode("email", "Omakase Oct 22!"), "email-omakase-oct-22");
  assert.equal(isValidCode("email-omakase-oct-22"), true);
  assert.equal(isValidCode("Bad Code"), false);
});

test("attribution: link code beats keywords; longest code wins", () => {
  assert.deepEqual(attribute({ utmContent: "IG-BIO" }, links), { linkId: "L1", channel: "Instagram", how: "link" });
  assert.equal(attribute({ source: "utm email-omakase-oct22" }, links).linkId, "L2");
  assert.deepEqual(attribute({ source: "Instagram" }, links), { linkId: null, channel: "Instagram", how: "platform_source" });
  assert.equal(attribute({ source: "Reserve with Google" }, links).channel, "Google Business Profile");
  assert.equal(attribute({ source: "Restaurant website (widget)" }, links).channel, "Website");
  assert.equal(attribute({ source: "OpenTable app" }, links).channel, "OpenTable network");
  assert.equal(attribute({ source: "Phone" }, links).channel, "Phone");
  assert.equal(attribute({ source: "" }, links).how, "unattributed");
});

test("CSV parser handles quotes, commas and CRLF", () => {
  const rows = parseCsv('﻿a,b,c\r\n"x, y","he said ""hi""",3\r\n\r\n');
  assert.deepEqual(rows, [
    ["a", "b", "c"],
    ["x, y", 'he said "hi"', "3"],
  ]);
  assert.equal(toIsoDate("10/22/2026"), "2026-10-22");
  assert.equal(toIsoDate("2026-10-22 19:30"), "2026-10-22");
});

test("OpenTable export: sources matched, cancellations kept, ids stable", () => {
  const t = {
    headers: ["Confirmation #", "Date Booked", "Visit Date", "Party Size", "Status", "Source", "Experience"],
    rows: [
      ["111", "10/01/2026", "10/22/2026", "2", "Seated", "Instagram", ""],
      ["112", "10/02/2026", "10/22/2026", "4", "Cancelled", "Restaurant website", ""],
      ["113", "10/03/2026", "10/23/2026", "2", "Booked", "", "Omakase 6:30"],
      ["", "", "", "", "", "", ""],
    ],
  };
  const p = parseOpenTable(t, links);
  assert.equal(p.rows.length, 3);
  assert.equal(p.rows[0].channel, "Instagram");
  assert.equal(p.rows[0].booked_on, "2026-10-01");
  assert.equal(p.rows[0].covers, 2);
  assert.equal(p.rows[1].status, "cancelled");
  assert.equal(p.rows[1].channel, "Website");
  assert.equal(p.rows[2].kind, "experience");
  assert.equal(p.rows[2].how, "unattributed");
  assert.deepEqual(
    p.rows.map((r) => r.import_key),
    parseOpenTable(t, links).rows.map((r) => r.import_key),
  );
});

test("Eventbrite tracking-links report: per link per month", () => {
  const t = {
    headers: ["Tracking Link", "Event", "Views", "Tickets Sold", "Gross Sales"],
    rows: [
      ["sms-nov20", "Halloween at Jay's", "120", "14", "$700.00"],
      ["https://www.eventbrite.com/e/123?aff=ig-bio", "Halloween at Jay's", "300", "9", "$450.00"],
      ["Total", "", "420", "23", "$1,150.00"],
    ],
  };
  const p = parseEventbrite(t, links, "2026-10");
  assert.equal(p.rows.length, 2);
  assert.equal(p.rows[0].channel, "SMS");
  assert.equal(p.rows[0].quantity, 14);
  assert.equal(p.rows[0].revenue_cents, 70000);
  assert.equal(p.rows[1].link_id, "L1");
  assert.equal(p.rows[0].booked_on, "2026-10-01");
  assert.equal(p.skipped[0].reason, "total row");
});

test("report: unmatched OpenTable pool shared by clicks to OpenTable (estimate)", () => {
  const base = { confirmedBookings: 0, tickets: 0, covers: 0, revenueCents: 0, spendCents: 0 };
  const { rows, poolRate } = buildReport(
    [
      { ...base, channel: "Instagram", humanClicks: 300, clicksToOpenTable: 300, spendCents: 30000 },
      { ...base, channel: "Email", humanClicks: 100, clicksToOpenTable: 100, confirmedBookings: 2 },
      { ...base, channel: "Phone", humanClicks: 0, clicksToOpenTable: 0, confirmedBookings: 5 },
    ],
    20,
  );
  assert.equal(poolRate, 0.05);
  assert.equal(rows[0].estimatedBookings, 15);
  assert.equal(rows[1].estimatedBookings, 5);
  assert.equal(rows[2].estimatedBookings, 0);
  assert.equal(rows[0].costPerBookingCents, 2000);
  // Never more estimated bookings than clicks.
  assert.equal(buildReport([{ ...base, channel: "X", humanClicks: 3, clicksToOpenTable: 3 }], 50).poolRate, 1);
});
