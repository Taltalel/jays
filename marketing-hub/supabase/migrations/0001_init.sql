-- Tal's Marketing Hub — initial schema.
-- Run once in a NEW Supabase project (SQL editor, or `supabase db push`).
--
-- Conventions
--   * Money is integer cents (bigint). Never floats.
--   * Calendar dates are `date` values in America/New_York.
--   * Instants are timestamptz.
--   * Card / bank numbers: last 4 digits only, enforced with CHECK constraints.
--   * RLS is ON for every table. Only emails listed in app_owners can read or
--     write. Cron jobs and the seed script use the service-role key, which
--     bypasses RLS and never reaches the browser.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Owners (the allowlist RLS checks). Filled from env vars by `npm run owners`.
-- No policies: only the service role can read or change it.
-- ---------------------------------------------------------------------------
create table public.app_owners (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.app_owners enable row level security;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_owners
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- ---------------------------------------------------------------------------
-- Spend
-- ---------------------------------------------------------------------------
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  aliases text[] not null default '{}',          -- other names seen on receipts
  channel text,                                    -- e.g. 'Meta/Instagram'
  brand text,                                      -- e.g. 'Jay''s'
  billing_cycle text not null default 'one-time'
    check (billing_cycle in ('monthly', 'annual', 'variable', 'quarterly', 'one-time')),
  usual_amount_cents bigint check (usual_amount_cents is null or usual_amount_cents >= 0),
  billing_day smallint check (billing_day between 1 and 31),
  method_last4 text check (method_last4 ~ '^[0-9]{4}$'),
  status text not null default 'Active'
    check (status in ('Active', 'Failing', 'Suspended', 'Paused', 'Cancelled', 'Duplicate')),
  action_note text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index vendors_name_key on public.vendors (lower(name));

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  vendor_id uuid references public.vendors (id) on delete restrict,
  amount_cents bigint not null,                    -- refunds are negative
  status text not null check (status in ('paid', 'due', 'failed', 'refund')),
  period_start date,
  period_end date,
  invoice_ref text,
  description text,
  channel text,                                    -- overrides vendor channel when set
  brand text,                                      -- overrides vendor brand when set
  card_last4 text check (card_last4 ~ '^[0-9]{4}$'),
  source text not null check (source in ('gmail', 'upload', 'api', 'manual')),
  source_id text not null,
  gmail_url text,
  storage_path text,                               -- uploaded receipt file (private bucket)
  parsed_confidence numeric(4, 3) check (parsed_confidence between 0 and 1),
  needs_review boolean not null default false,     -- excluded from totals until confirmed
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id)
);
create index transactions_date_idx on public.transactions (date desc);
create index transactions_vendor_idx on public.transactions (vendor_id);

create table public.payables (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors (id) on delete set null,
  description text not null,
  amount_cents bigint,
  due_date date,
  priority text not null default 'Decide' check (priority in ('Urgent', 'This week', 'Decide')),
  owner text,
  status text not null default 'open' check (status in ('open', 'paid', 'disputed', 'cancelled')),
  next_step text,
  resolved_at date,
  resolved_ref text,
  source_key text unique,                          -- seed idempotency key
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  month date not null check (extract(day from month) = 1),
  channel text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  updated_at timestamptz not null default now(),
  unique (month, channel)
);

-- Every Gmail message the sync has looked at, so nothing is parsed twice.
create table public.processed_emails (
  message_id text primary key,
  processed_at timestamptz not null default now(),
  outcome text not null check (outcome in ('booked', 'needs_review', 'not_receipt', 'duplicate', 'error')),
  transaction_id uuid references public.transactions (id) on delete set null,
  attempts smallint not null default 1,            -- errors are retried up to 3 times
  detail text
);

-- ---------------------------------------------------------------------------
-- Campaigns (Phase 4) and metrics (Phase 2+). Created now so later phases
-- need no destructive migrations.
-- ---------------------------------------------------------------------------
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start date,
  "end" date,
  goal text,
  budget_cents bigint,
  status text not null default 'planned' check (status in ('planned', 'live', 'finished', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.campaign_links (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  type text not null check (type in ('spend', 'email', 'post', 'ad', 'event', 'utm')),
  ref_id text not null,
  unique (campaign_id, type, ref_id)
);

create table public.daily_metrics (
  date date not null,
  source text not null,
  metric text not null,
  dimension text not null default '',
  value numeric not null,
  synced_at timestamptz not null default now(),
  primary key (date, source, metric, dimension)
);

create table public.social_comments (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  post_id text not null,
  comment_id text not null,
  author_handle text,
  text text,
  created_at timestamptz,
  ai_flag text,
  status text not null default 'new' check (status in ('new', 'seen', 'handled')),
  unique (platform, comment_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date,
  capacity integer,
  price_cents bigint,
  source text,
  external_id text,
  unique (source, external_id)
);

create table public.ticket_snapshots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  taken_at timestamptz not null default now(),
  sold integer not null,
  gross_cents bigint
);

-- ---------------------------------------------------------------------------
-- Integrations + sync bookkeeping
-- ---------------------------------------------------------------------------
create table public.integrations (
  key text primary key,
  status text not null check (status in ('ok', 'error')),
  last_check_at timestamptz not null default now(),
  last_error text
);

create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  rows integer,
  error text
);
create index sync_runs_source_idx on public.sync_runs (source, started_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vendors_touch before update on public.vendors
  for each row execute function public.touch_updated_at();
create trigger transactions_touch before update on public.transactions
  for each row execute function public.touch_updated_at();
create trigger payables_touch before update on public.payables
  for each row execute function public.touch_updated_at();
create trigger budgets_touch before update on public.budgets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: owner-only on every app table.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'vendors', 'transactions', 'payables', 'budgets', 'processed_emails',
    'campaigns', 'campaign_links', 'daily_metrics', 'social_comments',
    'events', 'ticket_snapshots', 'integrations', 'sync_runs'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy owner_all on public.%I for all to authenticated using (public.is_owner()) with check (public.is_owner())',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage: private bucket for uploaded receipts. Uploads go through signed
-- URLs minted server-side, so no storage policies are granted to users.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts', 'receipts', false, 20971520,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
