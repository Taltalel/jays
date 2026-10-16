/**
 * Every data source the Hub knows about, with exactly what it needs and how
 * to connect it. "Connected" is computed in status.ts: env vars present AND
 * the last live check succeeded. Sources without a live check yet are never
 * shown as connected.
 */

export interface IntegrationDef {
  key: string;
  name: string;
  phase: 1 | 2 | 3 | 4 | 5;
  /** What the Hub pulls from it. */
  pulls: string;
  /** IDs we already know (never guessed). */
  knownIds?: string[];
  envVars: { name: string; where: string; optional?: boolean }[];
  /** Steps only Tal can do, in order. */
  steps: string[];
  /** Read-only notes: scopes used, and any caveat about the provider's permissions. */
  access: string;
  /** True once a live health check is implemented. */
  hasCheck: boolean;
  /** No API — data arrives by upload or manual entry. */
  manual?: boolean;
}

export const INTEGRATIONS: IntegrationDef[] = [
  {
    key: "supabase",
    name: "Supabase (database)",
    phase: 1,
    pulls: "Stores everything the Hub shows. Separate project from the Review Hub.",
    envVars: [
      { name: "NEXT_PUBLIC_SUPABASE_URL", where: "Supabase → Project Settings → API → Project URL" },
      { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", where: "Supabase → Project Settings → API → anon public key" },
      { name: "SUPABASE_SERVICE_ROLE_KEY", where: "Supabase → Project Settings → API → service_role key (server only — never share)" },
    ],
    steps: [
      "Create a new Supabase project (do not reuse the Review Hub's).",
      "SQL editor → paste and run supabase/migrations/0001_init.sql.",
      "Add the three env vars in Vercel → Project → Settings → Environment Variables.",
      "Run `npm run owners` once (locally, with .env.local filled in) to load the sign-in allowlist into the database.",
    ],
    access: "Row-level security is on for every table; only allowlisted emails can read or write.",
    hasCheck: true,
  },
  {
    key: "anthropic",
    name: "Claude API (AI parsing)",
    phase: 1,
    pulls: "Reads receipts and invoices (Gmail + uploads) into vendor, amount, date, status and card last 4.",
    envVars: [{ name: "ANTHROPIC_API_KEY", where: "console.anthropic.com → Settings → API Keys → Create Key" }],
    steps: ["Create an API key in the Anthropic Console.", "Add it to Vercel as ANTHROPIC_API_KEY."],
    access: "Receives receipt text and files only. Long card/account numbers are masked before sending.",
    hasCheck: true,
  },
  {
    key: "gmail",
    name: "Gmail receipts",
    phase: 1,
    pulls: "Every receipt, invoice and failed-payment email in marketing@yesfbm.com → Spend Log.",
    knownIds: ["Inbox: marketing@yesfbm.com"],
    envVars: [
      { name: "GOOGLE_OAUTH_CLIENT_ID", where: "Google Cloud Console → APIs & Services → Credentials → your OAuth client (Web)" },
      { name: "GOOGLE_OAUTH_CLIENT_SECRET", where: "Same OAuth client → Client secret" },
      { name: "GMAIL_REFRESH_TOKEN", where: "Shown once on Integrations → Gmail → Connect, after you approve access" },
      { name: "GMAIL_BACKFILL_FROM", where: "Optional. First date to import, YYYY-MM-DD (default 2026-01-01)", optional: true },
    ],
    steps: [
      "Google Cloud Console → create (or pick) a project → APIs & Services → Library → enable the Gmail API.",
      "OAuth consent screen → User type: Internal (yesfbm.com Workspace) → add scope gmail.readonly.",
      "Credentials → Create OAuth client ID → Web application. Authorized redirect URIs: your Supabase callback (https://<project>.supabase.co/auth/v1/callback) AND https://<hub-domain>/integrations/gmail/callback.",
      "Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to Vercel and redeploy.",
      "Signed in to the Hub, open Integrations → Gmail → Connect Gmail, and approve as marketing@yesfbm.com.",
      "Copy the refresh token shown into Vercel as GMAIL_REFRESH_TOKEN, then redeploy.",
    ],
    access: "Scope: gmail.readonly only. The Hub can't send, delete, label or change mail.",
    hasCheck: true,
  },
  {
    key: "meta_ads",
    name: "Meta Ads (Instagram boosts)",
    phase: 2,
    pulls: "Daily spend, impressions, reach, clicks, CPM/CPC, results per campaign/ad, billing transactions.",
    knownIds: ["Ad account 724102651666313", "Pixel 1806539407208179"],
    envVars: [
      { name: "META_ACCESS_TOKEN", where: "Meta Business Settings → Users → System users → Generate token (scope ads_read)" },
      { name: "META_AD_ACCOUNT_ID", where: "Set to act_724102651666313" },
      { name: "META_PIXEL_ID", where: "Set to 1806539407208179" },
    ],
    steps: [
      "Meta Business Settings → Users → System users → Add a system user with the Employee role.",
      "Assign it ad account 724102651666313 with View performance access only.",
      "Generate a token for it with the ads_read permission (no ads_management).",
    ],
    access: "Scope: ads_read. The Hub can't change ads, budgets or billing.",
    hasCheck: false,
  },
  {
    key: "instagram",
    name: "Instagram (Jay's account)",
    phase: 2,
    pulls: "Followers, reach, profile visits, post/reel insights, comments.",
    envVars: [
      { name: "META_ACCESS_TOKEN", where: "Same system-user token as Meta Ads, with Instagram permissions added" },
      { name: "INSTAGRAM_BUSINESS_ACCOUNT_ID", where: "Meta Business Settings → Accounts → Instagram accounts → Jay's → ID" },
    ],
    steps: [
      "Business Settings → assign Jay's Instagram account and its Facebook Page to the system user.",
      "Add permissions instagram_basic, instagram_manage_insights, pages_read_engagement and instagram_manage_comments to the token.",
    ],
    access:
      "Meta has no read-only permission for comments (it is named instagram_manage_comments). The Hub only calls GET endpoints and never replies, hides or deletes.",
    hasCheck: false,
  },
  {
    key: "ga4",
    name: "Google Analytics 4",
    phase: 2,
    pulls: "Sessions, sources/UTMs, landing pages, key events (reserve_click, vip_signup, ticket clicks).",
    knownIds: [
      "Property 543067165 (G-BKW7FWYXMD)",
      "Agency tags G-JPV5EDJ08K / GTM-T3NVSMLX are removed after Oct 31",
    ],
    envVars: [
      { name: "GA4_PROPERTY_ID", where: "Set to 543067165" },
      { name: "GOOGLE_SERVICE_ACCOUNT_JSON", where: "Google Cloud → IAM → Service accounts → Keys → Add key (JSON). Paste the whole JSON." },
    ],
    steps: [
      "Google Cloud → enable the Google Analytics Data API.",
      "Create a service account (no project roles needed) and download a JSON key.",
      "GA4 → Admin → Property access management → add the service account email with the Viewer role.",
    ],
    access: "Scope: analytics.readonly, Viewer role only.",
    hasCheck: false,
  },
  {
    key: "gbp",
    name: "Google Business Profile",
    phase: 2,
    pulls: "Calls, direction requests, website clicks, search views.",
    knownIds: ["Jay's (verified listing)"],
    envVars: [
      { name: "GBP_LOCATION_ID", where: "Business Profile Manager → Jay's → the locations/… ID" },
      { name: "GBP_REFRESH_TOKEN", where: "Shown once by the Hub's Connect flow (Phase 2)" },
    ],
    steps: [
      "Request Business Profile API access from Google (the API access request form); approval can take days.",
      "Enable the Business Profile Performance API in the same Google Cloud project.",
      "Connect from Integrations once Phase 2 ships.",
    ],
    access:
      "Google offers only one scope (business.manage) for this API — there is no read-only scope. The Hub only calls the Performance API's read endpoints.",
    hasCheck: false,
  },
  {
    key: "mailchimp",
    name: "Mailchimp",
    phase: 3,
    pulls: "Campaign sends, opens, clicks, unsubscribes; list growth; VIP-SMS tag count.",
    knownIds: ["Audience \"jays\", list 95a68f795e", "Tag VIP-SMS"],
    envVars: [
      { name: "MAILCHIMP_API_KEY", where: "Mailchimp → Profile → Extras → API keys → Create a key (ends in -usXX)" },
      { name: "MAILCHIMP_LIST_ID", where: "Set to 95a68f795e" },
    ],
    steps: ["Create a dedicated API key named \"Marketing Hub (read)\".", "Add both env vars to Vercel."],
    access:
      "Mailchimp API keys always have full account access — there are no read-only keys. The Hub only makes GET requests and never sends or edits campaigns.",
    hasCheck: false,
  },
  {
    key: "eventbrite",
    name: "Eventbrite",
    phase: 3,
    pulls: "Tickets sold by day, gross, fees, capacity — Halloween and future events.",
    envVars: [
      { name: "EVENTBRITE_PRIVATE_TOKEN", where: "Eventbrite → Account settings → Developer links → API keys → Private token" },
      { name: "EVENTBRITE_ORG_ID", where: "Eventbrite → Organization settings → Organization ID" },
    ],
    steps: ["Create an API key in Eventbrite and copy its private token.", "Add both env vars to Vercel."],
    access: "Eventbrite tokens are account-level. The Hub only reads events and orders.",
    hasCheck: false,
  },
  {
    key: "opentable",
    name: "OpenTable",
    phase: 3,
    pulls: "Covers, reservations by source, experiences sold, cancellations.",
    knownIds: ["Restaurant 1426036", "Omakase experiences 813286, 813290, 813291, 813297, 813295, 813299"],
    envVars: [],
    steps: [
      "No self-serve API. In OpenTable for Restaurants, export the reservations/guest CSV.",
      "Upload it on the Events page once Phase 3 ships.",
    ],
    access: "File upload only.",
    hasCheck: false,
    manual: true,
  },
  {
    key: "toast",
    name: "Toast POS",
    phase: 3,
    pulls: "Net sales, covers, average check by day — to compare campaign days with normal days.",
    envVars: [
      { name: "TOAST_CLIENT_ID", where: "Toast Web → Integrations → Toast API access (if your plan includes it)", optional: true },
      { name: "TOAST_CLIENT_SECRET", where: "Same place as the client ID", optional: true },
      { name: "TOAST_RESTAURANT_GUID", where: "Toast Web → Restaurant info → GUID", optional: true },
    ],
    steps: [
      "Ask your Toast admin whether the account has API access with read-only scopes (orders/analytics).",
      "If not, the Hub will accept Toast's Sales Summary CSV export instead (Phase 3).",
    ],
    access: "Read-only API scopes, or CSV upload.",
    hasCheck: false,
  },
  {
    key: "review_hub",
    name: "Review Hub (read-only link)",
    phase: 3,
    pulls: "Rating and review count by platform, response rate, unanswered 1–2★ reviews.",
    knownIds: ["https://jays-review-hub.vercel.app"],
    envVars: [
      { name: "REVIEW_HUB_URL", where: "Set to https://jays-review-hub.vercel.app" },
      { name: "REVIEW_HUB_SUMMARY_KEY", where: "A random secret you add to BOTH apps; the Review Hub's summary endpoint checks it" },
    ],
    steps: [
      "Add a small read-only summary endpoint to the Review Hub (Phase 3 will include the exact code).",
      "Generate a long random key and set it in both Vercel projects.",
    ],
    access: "The Hub never writes to the Review Hub. Every review number links back to it.",
    hasCheck: false,
  },
  {
    key: "linkme",
    name: "LinkMe",
    phase: 3,
    pulls: "Link clicks (Pro plan).",
    envVars: [],
    steps: ["No API. Enter the monthly click total by hand (Phase 3)."],
    access: "Manual entry.",
    hasCheck: false,
    manual: true,
  },
  {
    key: "vip_sms",
    name: "VIP SMS sign-ups",
    phase: 3,
    pulls: "Sign-ups by source (?src=) from the /vip page on jaysfortlauderdale.com.",
    envVars: [],
    steps: ["Counted from the Mailchimp tag VIP-SMS once Mailchimp is connected."],
    access: "Via Mailchimp (read).",
    hasCheck: false,
  },
  {
    key: "google_ads",
    name: "Google Ads",
    phase: 5,
    pulls: "Spend, clicks, conversions, campaign status, billing status.",
    knownIds: ["Jay's account 919-233-9291 (run by M.O until Oct 31; admin access requested)"],
    envVars: [
      { name: "GOOGLE_ADS_DEVELOPER_TOKEN", where: "Google Ads → Tools → API Center (needs a manager account)" },
      { name: "GOOGLE_ADS_CUSTOMER_ID", where: "Set to 9192339291" },
      { name: "GOOGLE_ADS_LOGIN_CUSTOMER_ID", where: "Your manager (MCC) account ID, if access is through one", optional: true },
      { name: "GOOGLE_ADS_REFRESH_TOKEN", where: "Shown once by the Hub's Connect flow (Phase 5)" },
    ],
    steps: [
      "Get admin (or at least Read-only) access to 919-233-9291 from M.O.",
      "Apply for a Google Ads API developer token (Basic access).",
      "Connect from Integrations once Phase 5 ships.",
    ],
    access: "Read-only user access + the adwords scope used only for reporting queries.",
    hasCheck: false,
  },
  {
    key: "search_console",
    name: "Search Console",
    phase: 5,
    pulls: "Queries, clicks, impressions, position.",
    knownIds: ["Not set up yet"],
    envVars: [
      { name: "GSC_SITE_URL", where: "Set to sc-domain:jaysfortlauderdale.com after verifying the domain" },
      { name: "GOOGLE_SERVICE_ACCOUNT_JSON", where: "Same service account as GA4" },
    ],
    steps: [
      "search.google.com/search-console → Add property → Domain → jaysfortlauderdale.com → add the DNS TXT record.",
      "Settings → Users and permissions → add the service account email with Restricted permission.",
    ],
    access: "Scope: webmasters.readonly.",
    hasCheck: false,
  },
];

export function getIntegration(key: string): IntegrationDef | undefined {
  return INTEGRATIONS.find((i) => i.key === key);
}
