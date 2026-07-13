# Room 7 — room7hospitality.com

The website for **Room 7**, a Fort Lauderdale hospitality group — the house
behind **Jay's**, **Naked Taco**, **HighBar** and **Riviera**. Tagline:
_Elevated Hospitality._ Founder: Jay Shirodkar.

Green + gold. Restraint as luxury. The photography does the talking.

---

## Stack

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**
- **Static export** (`output: 'export'`) → deploy to Vercel _or_ drop the
  `out/` folder onto GoDaddy static hosting.
- Self-hosted fonts via `next/font` (Cormorant Garamond, Inter, Jost) — no
  runtime font requests, `font-display: swap`.
- All venue / group / press content lives in **editable data files** under
  `/content` so copy can be updated without touching components.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # type-check + static export to ./out
npx serve out      # preview the exported static site
```

## Project structure

```
app/
  layout.tsx            Root shell — fonts, metadata, Header, Footer, JSON-LD
  page.tsx              Homepage (composes the sections in components/home)
  globals.css           The design system — colour tokens, type, motion, scrim
  robots.ts / sitemap.ts  SEO endpoints (static-generated)
components/
  brand/Logo.tsx        The wordmark + "7" monogram (inline SVG, our fonts)
  layout/Header.tsx     Transparent-over-hero header, dims to forest on scroll,
                        dropdowns (Collection / About / Reserve), mobile menu
  layout/Footer.tsx     Group footer — rooms, explore, the house, legal
  home/*                Homepage sections (Hero, Collection, Standard, …)
  ui/*                  Reveal (scroll animation), ScrollProgress, Placeholder,
                        CTA
content/
  group.ts              Group identity, manifesto, values ("the standard"),
                        founder teaser, press outlets + quotes, boilerplate
  venues.ts             The four rooms — VERIFIED data + group-voice copy
  nav.ts                Navigation + per-venue Reserve links
lib/
  schema.ts             JSON-LD builders (Organization / Restaurant / NewsArticle)
public/
  brand/                Logo + monogram SVGs (PLACEHOLDERS — see below)
  og/                   Social share image (PLACEHOLDER)
  favicon.svg
```

## Editing content (no code required)

- **Change venue copy, hours, addresses, reservation links** →
  `content/venues.ts`. Each venue is one object; the `scenes` field feeds the
  _The Room / The Table / The Night_ structure on venue pages.
- **Change the group statement, values, founder blurb, press quotes** →
  `content/group.ts`.
- **Change the navigation** → `content/nav.ts`.

### Add a venue

1. Add an object to the `venues` array in `content/venues.ts` (copy an
   existing one as a template — every field is documented inline).
2. Add it to `collectionCards` if it should appear on the homepage.
3. Add it to `primaryNav` children in `content/nav.ts`.

### Add a press release _(when the /press hub is built)_

Press releases will live in `content/press.ts` as data objects, each with a
`slug`, `title`, `date`, `dek` and `body`. The `[slug]` route renders one
indexable page per release with `NewsArticle` schema (`lib/schema.ts`).

## Design system

Defined once in `app/globals.css` (`@theme`) and consumed as Tailwind tokens:

| Token | Hex | Use |
|---|---|---|
| `forest-deep` | `#0F2417` | primary background |
| `forest` | `#14331F` | panels, cards |
| `emerald` | `#1E4C34` | raised surfaces, hovers |
| `gold` | `#C6A24C` | THE accent — rules, labels, links (~10%) |
| `gold-light` | `#D8BE78` | hover / highlight |
| `champagne` | `#F1EBDA` | primary text on dark |
| `sage` | `#9DAE97` | secondary / body text |
| `mahogany` | `#5A2E22` | rare warm accent |

- **Type:** `.h1-hero` / `.h2-display` (Cormorant), body (Inter, ≥16px, ≤68ch),
  `.eyebrow` (Jost caps, gold, 0.15em tracking).
- **Scrim:** `.scrim` / `.scrim-full` — always place behind text over imagery.
- **Motion:** `[data-reveal]` (fade + 24px rise, 600ms) via `<Reveal>`; the
  whole system respects `prefers-reduced-motion`.
- **60 / 30 / 10:** ~60% deep forest, ~30% photography, ~10% gold.

## Placeholders — what still needs real assets

**Real venue photography is now in place** for every collection card and every
venue hero, extracted from the Room 7 brand book (`/public/venues/*.webp`, set
per venue in `content/venues.ts` via `heroImage` / `heroPosition`). Swap these
for higher-resolution originals when available (the brand-book copies are
~700px). Everything still marked **TODO** on screen (a gold-dot pill) is a
stand-in. **Never use stock photography** — one stock image undoes the whole
thing. Still to replace:

- **Hero film / photography** — the homepage hero still uses the stained-glass
  motif; drop in the Jay's hero film (muted, autoplay, loop, poster, < 3MB).
- **Galleries, scene sequences, founder portrait, event/careers bands** — still
  on-brand gradient placeholders that describe the shot needed. Shoot **the
  night — people in the rooms**, not empty interiors.
- **Logo + monogram** — `public/brand/*.svg` and `components/brand/Logo.tsx`
  are clean placeholders matching the brand-book spec (script "Room" + tall
  "7", deco rule with diamond terminals). Swap for the final custom lettering;
  never re-typeset the wordmark.
- **OG image** — `public/og/room7.svg` → export a 1200×630 PNG with real
  photography.
- **Instagram feed** — wire a lightweight embed (Behold / official embed).
- **Spotify playlist** — embed the live "Room 7 · After Dark" playlist.
- **Newsletter** — connect Klaviyo / Mailchimp in `components/home/Newsletter.tsx`.
- **Press outlet logos** — supplied SVGs in place of the text wordmarks.

## Deploy

**Vercel:** import the repo — it detects Next.js and builds automatically.

**Static hosting (GoDaddy etc.):** `npm run build` → upload the contents of
`out/` to the web root. `trailingSlash` is on, so folder-style URLs resolve to
`index.html`.

## SEO

- Per-page `<title>`, description, canonical, OG (`app/layout.tsx` + per-route
  metadata as pages are added).
- `Organization` JSON-LD on every page; `Restaurant` per venue and
  `NewsArticle` per release are pre-built in `lib/schema.ts`.
- `robots.txt` and `sitemap.xml` are generated. **Add each new route to
  `app/sitemap.ts` as it ships.**
- Wire GA4 + Google Search Console before launch.

## Build status

**Complete — 27 statically-exported routes:**

- Homepage (all sections)
- `/collection` + the four venue pages (`/collection/{jays,naked-taco,highbar,riviera}`)
  with rich, unique copy, the _The Room / The Table / The Night_ scene
  sequence, gallery lightbox, live map, and `Restaurant` schema
- `/about` (with the "Why Room 7" story + the standard) and the dedicated
  founder page `/about/jay-shirodkar`
- `/private-events` (capacity table + inquiry form)
- `/press` + per-release pages (`NewsArticle` schema, boilerplate)
- `/careers` (roles filterable by venue) + `/careers/[venue]`
- `/contact` (four routes + form + map)
- `/gift-cards`, `/privacy`, `/terms`, `/cookies`
- `robots.txt`, `sitemap.xml`, per-route metadata + OG

**Launch checklist (needs client input / assets):**

- Replace every on-screen **TODO** placeholder with real photography, the final
  logo lettering, the hero film, and outlet logos.
- Wire integrations: newsletter (Klaviyo/Mailchimp), Instagram feed, the
  Spotify playlist, form endpoint (`NEXT_PUBLIC_FORM_ENDPOINT`), reservation
  gift-card links, GA4 + Search Console.
- Private-event data for Naked Taco + HighBar (three Collins Ave spaces,
  50–275 guests, catering collections, booking terms) is filled from the real
  Catering & Events deck. **Confirm Jay's and Riviera capacities** in
  `content/events.ts` (their decks were >10 MB and couldn't be pulled).
- **The backlink plan (highest-leverage SEO):** add a footer link — _"A Room 7
  venue" → room7hospitality.com_ — on each venue's own site
  (jaysfortlauderdale.com, lovenakedtaco.com, therivierarestaurant.com). Replace
  lovenakedtaco.com's "Yes Hospitality Group" footer/`publisher` with Room 7,
  and **fix its broken canonical** (currently points at the Vercel preview URL).
- Have counsel review the legal pages.
