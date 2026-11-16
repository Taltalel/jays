# Booking tracking: where every link goes

The Hub can only credit a booking to a channel if the guest arrived through a **tracked
link**. This page lists every place a link must go, the routine for each new email, text or
post, and the few things only OpenTable or the host stand can provide.

Short links look like `https://go.jaysfortlauderdale.com/ig-bio` once the short domain is set
up (see the end of this page). Until then they work as `https://<hub address>/go/ig-bio`.

## 1. Standing links: set once

These are created automatically by `0002_booking_attribution.sql`. Copy each from the
Hub's **Links** page.

| Code | Put it here | Who does it |
|---|---|---|
| `ig-bio` | Instagram → Edit profile → Links. If the bio link is your LinkMe page, skip this one and use `linkme` below. | Tal |
| `linkme` | LinkMe → the **Reserve** button's URL | Tal |
| `site-reserve` | Every Reserve button on jaysfortlauderdale.com | Claude, once access to that site's repo is granted |
| `room7-reserve` | room7hospitality.com → RESERVE menu → Jay's, and the Jay's page | Claude, after the Hub is live (this repo) |
| `gbp-reserve` | Google Business Profile → Edit profile → **Reservations** link | Tal |
| `gbp-website` | Google Business Profile → **Website** link | Tal |
| `qr-table` | Any QR code on table cards, menus, posters and flyers. Make one QR per piece if you want them separate. | Tal / designer |

Add more in **Links → New link** for anything else with a permanent link: TikTok bio,
Facebook page, Yelp, the Room 7 press page.

## 2. New link for every send: the routine

Before anything goes out, open **Links → New link**, pick the channel, name it, and copy the
short link into the piece.

| What | Channel | Name it like | Code it suggests |
|---|---|---|---|
| Mailchimp email | Email | `Omakase email Oct 22` | `email-omakase-email-oct-22` |
| VIP text blast | SMS | `VIP text Nov 20` | `sms-vip-text-nov-20` |
| IG story link sticker | Instagram | `Story Thanksgiving` | `ig-story-thanksgiving` |
| IG post / reel caption ("link in bio") | Use `ig-bio` or `linkme`. Story stickers get their own link. | | |
| Paid Instagram boost | Paid ads | `Boost Omakase Oct` | `ad-boost-omakase-oct` |
| Influencer / media partner | Influencers & Media | `Eat with Dami Oct` | `partner-eat-with-dami-oct` |
| Event (Eventbrite) | any | pick "Other URL" and paste the Eventbrite event link | the Hub adds Eventbrite's `aff` code automatically |

Rules:
- **Never paste the raw OpenTable or Eventbrite link.** Always the short link.
- **One link per send.** Two emails in a week get two links.
- In Mailchimp, put the short link on **every** button and link in the email, not just the first.

## 3. Bookings the links can't see

- **Host stand question.** Have hosts ask "How did you hear about us?" for every party at check-in.
  At the end of the night, enter the tallies in **Bookings → Host stand & offer codes**. This is
  the only way to count phone bookings, walk-ins, and guests who saw a post and booked later on
  another device.
- **Offer codes (optional).** Give each channel its own code ("IGNOV", "VIPTEXT"). When it's
  redeemed, record it as an offer code in the same form.
- **OpenTable private notes.** If OpenTable lets you add a "How did you hear about us?" question to
  the booking form, turn it on. The answer appears in the export and is matched automatically.

## 4. Imports: about 5 minutes, weekly or monthly

- **OpenTable:** OpenTable for Restaurants → Reports → Reservations → export CSV, including the
  source / "booked via" column if offered → Hub **Bookings → Import bookings → OpenTable**.
- **Eventbrite:** Reporting → Tracking links → pick the events → export CSV → Hub **Bookings →
  Import bookings → Eventbrite**, choosing the month. Re-importing the same file never double counts.
- When the Eventbrite and OpenTable connections arrive (Phase 3), these imports become automatic.

## 5. Ask OpenTable (Tal)

Email or call the OpenTable rep for restaurant **1426036**:
1. "Can our reservation export include the booking source and the UTM tags on the reservation link
   (utm_source, utm_campaign, utm_content)?" If yes, every OpenTable booking matches its exact link
   and the Hub's numbers become **confirmed** instead of estimated.
2. "Can you fix our Google Analytics integration? The last attempt errored." This sends confirmed
   bookings to GA4 with their source.
3. "Can we add a 'How did you hear about us?' question to the booking form?"

## 6. Short domain `go.jaysfortlauderdale.com` (optional, nicer links)

1. Vercel → the Hub project → Settings → Domains → add `go.jaysfortlauderdale.com`.
2. At the DNS provider for jaysfortlauderdale.com (GoDaddy), add the record Vercel shows,
   usually **CNAME `go` → `cname.vercel-dns.com`**.
3. Vercel → Settings → Environment Variables → `SHORT_LINK_BASE` = `https://go.jaysfortlauderdale.com` → Redeploy.

That domain serves only the short links. Anything else on it redirects to the website.
