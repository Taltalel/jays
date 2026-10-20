# Setup checklist: Tal's Marketing Hub (Phase 1)

About 45 minutes, all in a browser, with no coding or Terminal. Do the steps in order. Anything in
`<angle brackets>` is a value you copy from an earlier step.

Where this guide says **hub address** it means `https://tal-marketing-hub.vercel.app`. If Vercel
gives you a different address in step 6, use that one everywhere instead.

---

## 0. Fix the Vercel card first (5 min)

Vercel has failed to charge **$20.00 to the Visa ending 6251** six times since Oct 5 (emails from
failed-payments@vercel.com). Until that's fixed, Vercel may block new projects.

- vercel.com → sign in → team **Room 7** → **Settings → Billing** → update the card → retry the payment.
- Also confirm in **Settings → Members** that marketing@yesfbm.com is an **Owner**. Claude's
  Vercel connection got "no permission to create projects", so the account may only be a Member
  or Viewer.

## 1. GitHub: private repo (2 min)

- github.com → **New repository** → name `jays-marketing-hub` → **Private** → leave
  "Add a README" **unticked** → Create.
- Tell Claude it's ready. Claude moves the code there, with its history.

## 2. Supabase: database (10 min)

1. supabase.com → sign up with marketing@yesfbm.com → **New project**.
   - Name: `tal-marketing-hub`. Region: **East US (North Virginia)**.
   - Database password: generate one and save it in your password manager. You won't need it day to day.
   - Plan: **Free** is fine to start.
2. When the project is ready: **SQL Editor → New query**. Paste the whole contents of
   `supabase/migrations/0001_init.sql` from the repo, then press **Run**. It should say "Success. No rows returned".
3. **Project Settings → API** (or "API Keys"). Copy these three values somewhere safe; you'll paste them into Vercel in step 6:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` / secret key → `SUPABASE_SERVICE_ROLE_KEY` (**never share this one**)

## 3. Google Cloud: Gmail access + Google sign-in (15 min)

Sign in to console.cloud.google.com as **marketing@yesfbm.com**.

1. Top bar → project picker → **New project** → name `Marketing Hub` → Create, then select it.
2. **APIs & Services → Library** → search "Gmail API" → **Enable**.
3. **Google Auth Platform** (formerly "OAuth consent screen"):
   - **Branding**: App name `Tal's Marketing Hub`, support email marketing@yesfbm.com.
   - **Audience**: **Internal**.
     - If "Internal" is greyed out, the yesfbm.com Google Workspace admin has to allow it. Ask them,
       or tell Claude and we'll use "External → Testing" with you as the only test user.
       (Refresh tokens then expire every 7 days, so Internal is much better.)
   - **Data access → Add or remove scopes**: tick `.../auth/gmail.readonly` → Update → Save.
4. **Clients → Create client** → type **Web application**, name `Marketing Hub`.
   - **Authorized redirect URIs**, add both:
     - `https://<your-project>.supabase.co/auth/v1/callback`, using the Project URL from step 2.3
     - `<hub address>/integrations/gmail/callback`
   - Create → copy **Client ID** → `GOOGLE_OAUTH_CLIENT_ID` and **Client secret** →
     `GOOGLE_OAUTH_CLIENT_SECRET`.

## 4. Supabase: turn on Google sign-in (3 min)

1. Supabase → **Authentication → Sign In / Providers → Google** → Enable → paste the Client ID and
   Client secret from step 3.4 → Save.
2. **Authentication → URL Configuration**:
   - Site URL: `<hub address>`
   - Redirect URLs → Add: `<hub address>/auth/callback`

## 5. Anthropic: AI receipt reading (5 min)

1. console.anthropic.com → sign up → **Billing** → add a card and buy a small credit (e.g. $25).
2. **Limits** → set a monthly spend limit (suggested **$50**). Expected use is ~$3–10/month after a
   one-time ~$20–40 for reading past receipts back to Jan 1.
3. **API Keys → Create Key**, named `Marketing Hub` → copy → `ANTHROPIC_API_KEY`.

## 6. Vercel: create the Hub (5 min)

vercel.com → team **Room 7** → **Add New → Project** → import **jays-marketing-hub** →
project name `tal-marketing-hub`.

- **Root Directory**: leave as is (`./`) once the code is in its own repo. If it's still inside
  the `jays` repo, set it to `marketing-hub`.
- **Environment Variables**: add these before pressing Deploy:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from step 2.3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from step 2.3 |
| `SUPABASE_SERVICE_ROLE_KEY` | from step 2.3 |
| `ALLOWED_EMAIL_PRIMARY` | `marketing@yesfbm.com` |
| `BACKUP_ADMIN_EMAIL` | your backup Google address (optional) |
| `APP_URL` | `<hub address>` |
| `CRON_SECRET` | any long random string, e.g. a 40-character password from your password manager |
| `ANTHROPIC_API_KEY` | from step 5.3 |
| `GOOGLE_OAUTH_CLIENT_ID` | from step 3.4 |
| `GOOGLE_OAUTH_CLIENT_SECRET` | from step 3.4 |

Press **Deploy**. If Vercel gives an address other than `tal-marketing-hub.vercel.app`, update
`APP_URL`, the Google redirect URI (3.4) and the Supabase URLs (4.2) to match.

## 7. First sign-in (5 min)

1. Open `<hub address>` → **Sign in with Google** as marketing@yesfbm.com.
2. **Integrations → Check now**. Supabase and Claude should show **Connected**.
3. **Integrations → Gmail → Connect Gmail** → approve as marketing@yesfbm.com. Copy the token it
   shows → Vercel → Settings → Environment Variables → add `GMAIL_REFRESH_TOKEN` → **Redeploy**.
4. Back in the Hub: **Integrations → Check now** → Gmail shows Connected → **Sync receipts now**.
   After that it runs by itself every 3 hours, catching up on past receipts about 30 at a time.
5. **Spend → Import spreadsheet** → choose `Jays-Marketing-Spend-Log.xlsx` → **Preview** → check
   the columns it found → **Import**.

That's Phase 1. Tell Claude what you see, and it moves on to Phase 2 (Meta Ads, Instagram, GA4,
Business Profile) after your OK.
