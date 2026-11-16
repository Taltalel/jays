-- Tal's Marketing Hub — booking attribution (tracked links, clicks, bookings).
-- Run after 0001_init.sql (SQL editor → paste → Run). Safe to run twice.

-- One row per tracked link (e.g. /go/ig-bio). The public redirect counts the
-- click, adds UTM tags and forwards the guest to `destination`.
create table if not exists public.tracked_links (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9][a-z0-9-]{0,47}$'),
  label text not null,
  channel text not null,            -- attribution channel, e.g. 'Instagram', 'Email', 'SMS'
  utm_source text not null,
  utm_medium text not null,
  utm_campaign text,
  utm_content text,
  destination text not null check (destination ~ '^https://'),
  campaign_id uuid references public.campaigns (id) on delete set null,
  placement text,                   -- where it lives: "Instagram bio", "Mailchimp Nov 20", ...
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- One row per click. No IP address or full user agent is stored.
create table if not exists public.link_clicks (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.tracked_links (id) on delete cascade,
  clicked_at timestamptz not null default now(),
  is_bot boolean not null default false,  -- link previews (Instagram, iMessage, Slack...) are not people
  device text,                            -- 'mobile' | 'desktop' | 'tablet' | 'unknown'
  referrer_host text
);
create index if not exists link_clicks_link_idx on public.link_clicks (link_id, clicked_at desc);

-- Bookings from every source: OpenTable export rows, Eventbrite tracking-link
-- report rows, and manual tallies (host stand, offer codes, phone).
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('opentable', 'eventbrite', 'manual')),
  booked_on date not null,          -- New York date the booking was made (or the report month)
  kind text not null default 'reservation'
    check (kind in ('reservation', 'experience', 'ticket', 'walk_in', 'phone', 'other')),
  quantity integer not null default 1 check (quantity >= 0),  -- reservations, orders or tickets
  covers integer check (covers is null or covers >= 0),
  revenue_cents bigint,
  status text not null default 'booked' check (status in ('booked', 'cancelled', 'no_show')),
  link_id uuid references public.tracked_links (id) on delete set null,
  channel text,                     -- set when the source is known (matched link or stated channel)
  source_label text,                -- the platform's own source text, kept as-is
  how text not null default 'unattributed'
    check (how in ('link', 'platform_source', 'host_stand', 'offer_code', 'unattributed')),
  note text,
  import_key text unique,           -- idempotent imports
  created_at timestamptz not null default now()
);
create index if not exists bookings_date_idx on public.bookings (booked_on desc);

-- RLS + grants (same rules as 0001: owner only; anon gets nothing).
do $$
declare
  t text;
begin
  foreach t in array array['tracked_links', 'link_clicks', 'bookings']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists owner_all on public.%I', t);
    execute format(
      'create policy owner_all on public.%I for all to authenticated using (public.is_owner()) with check (public.is_owner())',
      t
    );
    execute format('grant select, insert, update, delete on public.%I to authenticated, service_role', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end;
$$;

-- The standard always-on links. Destinations can be edited on the Links page.
-- OpenTable restaurant 1426036 (the restref link the Room 7 site already uses);
-- website jaysfortlauderdale.com.
insert into public.tracked_links (code, label, channel, utm_source, utm_medium, utm_campaign, destination, placement)
values
  ('ig-bio',       'Instagram bio — Reserve',          'Instagram',               'instagram', 'social',  'bio',       'https://www.opentable.com/restref/client/?restref=1426036', 'Instagram profile link'),
  ('linkme',       'LinkMe — Reserve button',          'LinkMe',                  'linkme',    'social',  'bio-links', 'https://www.opentable.com/restref/client/?restref=1426036', 'LinkMe page, Reserve button'),
  ('site-reserve', 'Website — Reserve button',         'Website',                 'website',   'referral','reserve',   'https://www.opentable.com/restref/client/?restref=1426036', 'jaysfortlauderdale.com Reserve buttons'),
  ('gbp-reserve',  'Google Business Profile — Reserve','Google Business Profile', 'google',    'organic', 'gbp',       'https://www.opentable.com/restref/client/?restref=1426036', 'Google Business Profile reservation link'),
  ('gbp-website',  'Google Business Profile — Website','Google Business Profile', 'google',    'organic', 'gbp',       'https://jaysfortlauderdale.com/',                       'Google Business Profile website link'),
  ('room7-reserve','Room 7 website — Reserve Jay''s',  'Website',                 'room7',     'referral','reserve',   'https://www.opentable.com/restref/client/?restref=1426036', 'room7hospitality.com RESERVE menu and Jay''s page'),
  ('qr-table',     'QR — table / print',               'Print & QR',              'qr',        'print',   'in-venue',  'https://www.opentable.com/restref/client/?restref=1426036', 'QR codes on cards, menus, posters')
on conflict (code) do nothing;
