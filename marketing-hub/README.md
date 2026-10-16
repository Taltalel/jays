# Tal's Marketing Hub

Private, read-only marketing dashboard for Jay's Fort Lauderdale. Only Tal can sign in.
This is a separate app from the website (repo root) and from the Review Hub. It has its own
Vercel project and its own Supabase database.

> **Why it's in this folder:** the plan is a separate private repo, but this session couldn't
> create one. Everything here is self-contained (its own `package.json`, lockfile, config), so it
> can move to a private repo as-is. It holds code only: the spend spreadsheet, `.env*` files and
> receipts are never committed. This repo is public.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind 4 · Supabase (Postgres + Auth + Storage) ·
Vercel + Vercel Cron · Claude API (`claude-sonnet-5-5`) for receipt parsing.

## Rules the code enforces

| Rule | Where |
|---|---|
| Single user | Three locks: `proxy.ts` (every request) → `requireOwner()` in every page, action and route → row-level security (`is_owner()` against `app_owners`). Non-allowlisted Google accounts are signed straight back out. |
| Honest connections | `lib/integrations/status.ts`: "Connected" only when required env vars exist and the last live check passed (and is under 24h old). Everything else says why. |
| Read-only | Gmail uses `gmail.readonly` only; the connect flow rejects broader Gmail scopes. No code path posts, sends or edits anything outside this app's own database. |
| Secrets | Env vars only (`.env.example`). The Gmail refresh token is shown once and never stored. Errors pass through `redactSecrets()` before they are saved. |
| Card numbers | Last 4 only: DB `CHECK` constraints, `last4()` on every input, and long digit runs are masked before text is sent to the AI. |
| Money and time | Integer cents (`bigint`); dates in America/New_York (`lib/time.ts`). |
| Sources | Every number shows its source and a "last synced" time. |

## Phase 1 (this phase)

- **Sign-in**: Google via Supabase Auth, allowlist `ALLOWED_EMAIL_PRIMARY` + `BACKUP_ADMIN_EMAIL`.
- **Spend**:
  - Monthly Payments, Outstanding — To Pay (mark Paid with date + ref, or Disputed), Spend Log
    (filters by month, vendor, channel, brand, status and source; links back to Gmail), Budgets.
  - Add expense, with a duplicate guard.
  - Upload receipt: PDF/photo → private Storage → Claude extraction → confirm screen.
  - Needs-review queue: anything low-confidence or incomplete waits here and is excluded from
    totals.
- **Gmail receipt sync**:
  - Runs every 3 hours, plus a "Sync receipts now" button.
  - Checks at most 30 new emails per run, oldest first, so the backfill progresses.
  - Each email is parsed only once.
  - Dedupes on vendor + amount + date + status, or vendor + invoice ref.
- **Alerts** (Home → "Needs action today"):
  - failed or declined payments with no later successful payment;
  - overdue and due-soon payables;
  - Failing or Suspended accounts;
  - duplicate subscriptions (same vendor billed monthly and annually);
  - receipts needing review.
- **Integrations**: status and exact connect steps for all 14 sources plus Supabase and Claude.

## Setup (steps only Tal can do)

1. **Supabase**: create a new project, then open the SQL editor and run
   `supabase/migrations/0001_init.sql`.
2. **Google Cloud**:
   - Create a project and enable the **Gmail API**.
   - OAuth consent screen: **Internal** (yesfbm.com Workspace), scope `gmail.readonly`.
   - Create an OAuth client (Web) with these redirect URIs:
     - `https://<project>.supabase.co/auth/v1/callback`
     - `https://<hub-domain>/integrations/gmail/callback`
3. **Supabase → Authentication**:
   - Providers → Google: paste the client ID and secret.
   - URL Configuration: set Site URL to `https://<hub-domain>` and add
     `https://<hub-domain>/auth/callback` to Redirect URLs.
4. **Vercel**:
   - New project from this repo with **Root Directory = `marketing-hub`**.
   - Add the env vars from `.env.example`.
5. **Local, once**:
   - `cp .env.example .env.local` and fill it in.
   - `npm run owners` loads the allowlist into the database.
   - `npm run seed -- --dry-run`, then `npm run seed`.
6. **In the Hub**:
   - Integrations → **Connect Gmail**, signed in as marketing@yesfbm.com.
   - Paste the refresh token into Vercel as `GMAIL_REFRESH_TOKEN` and redeploy.
   - Press **Check now**.

Cron note: `vercel.json` runs `/api/cron/sync` every 3 hours, which needs a Vercel **Pro** plan
(Hobby allows only daily crons). On Hobby, change the schedule to `0 11 * * *`.

## Commands

```bash
npm run dev          # local dev
npm run lint
npm run typecheck
npm test             # unit tests (money, redaction, receipt rules, seed importer)
npm run build
npm run owners       # sync allowlist → app_owners (uses .env.local)
npm run seed         # import seed/Jays-Marketing-Spend-Log.xlsx (idempotent; --dry-run first)
```

## Layout

```
proxy.ts                         first auth gate
supabase/migrations/0001_init.sql  all tables, RLS, storage bucket
lib/auth.ts                      requireOwner()
lib/ai/receipt.ts                Claude receipt parser + post-processing rules
lib/gmail/                       read-only Gmail client + sync job
lib/spend/                       queries + booking/dedupe
lib/alerts.ts                    "Needs action today"
lib/integrations/                registry (steps, env vars), live checks, status
app/(hub)/                       pages (Home, Spend, Integrations)
app/api/cron/sync                health checks + Gmail sync
scripts/                         seed importer, owners sync
```
