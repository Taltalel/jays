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

## Setup

Step-by-step, browser-only checklist: **[SETUP.md](SETUP.md)**. No local commands are needed:

- the sign-in allowlist syncs into the database on sign-in and on every health check;
- the spreadsheet is imported in the app (Spend → Import spreadsheet), with a preview first.

Cron note: `vercel.json` runs `/api/cron/sync` every 3 hours, which needs a Vercel **Pro** plan
(Hobby allows only daily crons, and only non-commercial use).

## Commands

```bash
npm run dev          # local dev
npm run lint
npm run typecheck
npm test             # unit tests (money, redaction, receipt rules, seed importer)
npm run build
npm run owners       # developer-only: sync allowlist → app_owners (the app also does this)
npm run seed         # developer-only: same as Spend → Import spreadsheet (--dry-run first)
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
lib/spend/seed-*.ts              spreadsheet parser + idempotent import
scripts/                         command-line seed + owners (developer-only)
```
