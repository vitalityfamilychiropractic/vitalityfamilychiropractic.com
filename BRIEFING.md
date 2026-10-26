# Briefing: original builder to the preview site

Read this before changing the preview branch. The original project is
`/Users/nmclarty/Downloads/vitality-site` (no git). The site you are editing is
the `preview` branch of `vitalityfamilychiropractic.com`. The visual design and
the approved College Station wording came from that original. The application
around them was replaced.

Do not port the original builder, its safeguards, or its file layout back in.
Do not treat Celebration as an unfinished second site. It is a live office on
this one site.

## What the original was

A Node script, `build.mjs`, with no npm install. It wrote plain HTML for one
office at a time into `dist/<location>/`.

- College Station was the only built office: 13 pages.
- Celebration's config existed and was empty. The build was not allowed to run
  until Celebration had its own approved content. Its planned domain was
  `https://vfcofcelebration.com`.
- Approved wording lived in `content/locked/`. Page structure lived in
  `content/structure/*.json`. The build stopped if the locked file changed
  shape. `scripts/verify-locked.mjs` compared the built HTML to the locked file.
- Preview builds were `noindex` and showed yellow markers for anything with
  `verified: false`. `--production` refused to run while any phone, address,
  photo permission, shop URL, or open flag was unverified.
- Analytics was a slot, turned off. No snippet was installed.
- Photos were a flat folder, `public/images/`, described in `config/photos.json`.
- Templates were `src/templates/*.mjs`. Shared chrome was `layout.mjs`.

Owner decisions from 2026-10-25 that still hold:

- Our Care and New Patients are menu headings, not pages.
- "Explore Our Care" and "Explore All Our Services" go to Prenatal.
- No contact form. First-visit scheduling buttons dial the office. Book Now
  opens that office's Jane App.
- The menu label is "Your First Visit".
- The only authorized wording fix in the locked Adult & Family copy is
  "thyep,ey" to "they".
- Pricing figures are the published figures. Do not recalculate them.
- College Station insurance is BCBS PPO and BCBS HealthSelect. The under-five
  and superbill sentences stay.
- Team order at College Station is Mikah, Christie, Yvonne, Mikayla, Candice.
- Massage Therapy uses the massage manuscript, not Candice's bio. Her bio stays
  on Meet Our Team.

## What preview is

One Astro 7 site, built with Bun (`bun run dev`, `bun run build`). Both offices
are directories on `https://www.vitalityfamilychiropractic.com`.

| Office | Path | Jane App | Analytics |
| --- | --- | --- | --- |
| Celebration | `/celebration/` | `https://vfccelebration.janeapp.com/` | `G-D120PL4X89` |
| College Station | `/college-station/` | `https://vfc.janeapp.com/` | `G-P4WYJN76TD` |

`/` is a brand landing page in dev and in `astro build`, and it is in the
sitemap. On Cloudflare, `public/_redirects` sends `/` to `/college-station/`
with a 301. Astro does not apply `_redirects`. The brand landing page and
`/privacy/` use the Celebration measurement id (`site.analyticsId`).

There is no `verified` flag, no locked-file check, and no production gate.
`bun run build` always builds. Pages are indexable. Do not put the yellow
verification UI back.

## Where to edit now

| Concern | File |
| --- | --- |
| Office facts: address, hours, prices, team order, lead, booking, aliases | `src/config/locations.ts` |
| Photo catalog and WebP widths | `src/config/photos.ts` |
| Brand name, logo, default analytics, shop nav | `src/config/site.ts` (`shop.inNav`) |
| Shared page sections | `src/content/pages/*.md` |
| Shop catalog | `src/content/pages/shop.md` (`products`). Images in `public/assets/img/shop/` |
| Community partners | `src/content/pages/partners.md`. Each partner's `locations` names the offices |
| Our Care pages | `src/content/services/*.md` |
| A person | `src/content/team/*.md` |
| How a section kind renders | `src/components/Blocks.astro` |
| Nav | `src/lib/nav.ts` |
| `{{tokens}}` on office pages | `src/lib/tokens.ts` |
| Privacy contact block | `src/lib/pages.ts` (`privacyHtml`) |
| JSON-LD | `src/lib/schema.ts` |
| Old-URL redirects | `astro.config.mjs` and `public/_redirects` |
| How to write front matter | `README.md`, section "Page front matter" |

`src/config/types.ts` is the shape the build checks. The team collection schema
is strict: an unknown key in a team file fails the build. Page and service
`sections` are loose on purpose.

Copy an office entry to add an office. No new route file is required. `team`
on the location is the only display order. Do not put an order field on the
person. `lead` is who `{{lead}}` names, and whose name the landing card uses.
To show a partner at that office, add its slug to the partner's `locations`
in `src/content/pages/partners.md`. An unknown office slug fails the build.

## Content model

Locked Markdown plus a separate layout JSON became one Markdown file with YAML
front matter. The body of a page file is used only for the privacy policy.
Home, services, first visit, community, and classes render `sections`. Team
bios are the Markdown body under each person's front matter. Pricing numbers
are not in Markdown. They are `location.pricing`.

Strings may use tokens (`{{city}}`, `{{phone}}`, `{{phoneHref}}`, `{{lead}}`,
`{{homeClaim}}`, `{{homeBlurb}}`, `{{insuranceFaq}}`, and the others in the
README). A misspelled token fails the build. There are no `{{doctor}}` or
`{{doctorFull}}` tokens. Use `{{lead}}` and `{{leadFull}}`.

`homeBlurb` is the last sentence of the office home meta description and the
description in that office's JSON-LD. College Station's is the Brazos Valley
"13 years" sentence. Celebration's is "Now welcoming new patients." Do not put
the College Station claim on Celebration. Celebration's `homeClaim` says Dr.
Christie founded the practice and later opened Celebration. It does not say
she is the leader in the Brazos Valley.

## URLs and navigation

Original College Station pages lived at the root (`/our-care/prenatal/`,
`/massage-therapy/`, `/contact/`). Preview prefixes every office page with the
slug.

Massage moved. It was its own nav item and its own URL, `/massage-therapy/`.
It is now a child of Our Care at `/{office}/our-care/massage-therapy/`, and
only if that office lists `massage-therapy` in `services`. Celebration does
not. `/massage-therapy/` redirects to the College Station care page.

Our Care and New Patients are still headings, not links. Shop is one item in
every office menu and links to `/{office}/shop/`. The catalog is the
`products` list in `src/content/pages/shop.md`. Buy links are `example.com`
stand-ins until a real store URL is ready. Do not guess one. `shop.inNav` in
`src/config/site.ts` turns the item on or off for every office. While that is
false, production menus omit it and the dev server still shows the link in gray.

There is no Our Values page. `/our-values/` and `/{office}/our-values/`
redirect to the office home. Old Jekyll paths (`/specialties/pregnancy-care/`,
`/team/`, `/pricing/`, `/contacts/`) redirect to the new College Station paths.
Root copies of the current paths (`/our-care/prenatal/`, `/contact/`, and the
rest) also redirect to `/college-station/...`, because the original site
published them at the root.

`/privacy/` and `/{office}/privacy/` serve one file,
`src/content/pages/privacy.md`. `primaryOffice` names the office for the
contact block. It is `college-station`. Both URLs fill that block from that
office:

| Token | Becomes |
| --- | --- |
| `{{formatStreet}}` | `formatStreet()`, street and suite |
| `{{formatCityLine}}` | City and state abbreviation |
| `{{zip}}` | `address.zip` |
| `{{email}}` | That office's email |
| `{{telHrefFormatted}}` | `telHref()` with spaces, e.g. `+1 979 703 7977` |

Those five are the only tokens the policy body accepts. An office privacy page
still uses `summary` for its meta description, so `{{city}}` and `{{state}}`
name the office in the URL. `/privacy/` uses `brandSummary`, which must contain
no token. A trailing backslash on a contact line keeps that line on its own row.

## Celebration is no longer empty

The original Celebration file had null phone, address, hours, booking, SEO,
and pages. Preview fills it:

- 605 Celebration Avenue, Celebration, FL. Phone (407) 584-7900.
- Hours differ from College Station, including Friday "By appointment".
- Team is Christie only. She is the lead.
- Services are prenatal, newborn-infant, pediatric, and adult-family. No massage.
- Insurance is the published out-of-network statement. Do not add the College
  Station under-five BCBS sentence.
- Announcement above the page: "Now accepting new patient appointments."
- Do not show College Station staff (Mikah, Yvonne, Mikayla, Candice) or
  College Station interiors as if they were the Celebration office. When a
  shared page asks for a College Station photo id, Celebration's
  `photoAliases` supplies the substitute. The substitute keeps its own crop.

## Chrome

- Header wordmark is the logo, `/assets/img/logo.svg`, not the words "Vitality
  Family Chiropractic". The image `alt` is empty. The link's accessible name
  is "Vitality Family Chiropractic, home".
- The footer uses that same logo, painted white with a CSS mask, 70px tall,
  shifted 10px left. It is not the old two-line text wordmark.
- Fonts are Fraunces and Nunito Sans, in `src/styles/site.css` then
  `extras.css`. There is no Bootstrap.
- The location control in the header is a `details` switcher to the other
  office. The landing page, the 404, and `/privacy/` have no switcher.
- Book Now is in the header, the mobile menu, and the mobile bar. It opens the
  office's `bookingUrl` in a new tab.
- "Call to Schedule" and the other phone buttons are `tel:` links. `telHref()`
  returns `+1` plus digits and does not include `tel:`. Callers that already
  prefix `tel:` must keep using `telHref`, not the `phoneHref` token, or the
  scheme is doubled. The token `{{phoneHref}}` is the full `tel:` URL.
  `telHrefFormatted()` is only the spaced display form used in the privacy
  contact line. Leave `telHref()` compact.
- Facebook is only `sameAs` in JSON-LD. There is no Facebook link in the header
  or footer.
- In `bun run dev` only, hovering a catalog photo shows its photo id. An alias
  also shows the id the page asked for. Production HTML does not include it.

## Landing page

`src/pages/index.astro` is the brand landing page: the tagline, the h1
"Chiropractic care for growing families", the union of services offered by
either office (so Massage Therapy is a pill even though Celebration does not
offer it), and one card per office.

Each card shows the `landing-office` photo, the office name, "with {lead}",
the address, the phone, hours, and "Visit this office". The lead is
`location.lead`, not the first person in `team`. Both offices currently name
Christie McLarty, DC. Changing `lead` changes the name. Changing the
`landing-office` alias changes the photo. Do not hard-code Mikah onto the
College Station card.

The whole card is one link to the office. The phone link and the hours
disclosure sit above that link so they can still be clicked.

## Team page

Bios, tagline, facts, and portrait id live on the person. Order comes from
`location.team`. On a wide screen the portrait sits on the left, then the
right, then the left, and so on. The text column stays the wider one. Below
960px the portrait stays above the text for every person.

## Address, hours, schema

Visible addresses and schema.org `PostalAddress` omit the ZIP. Both offices.
`address.zip` stays on the location because the Google Maps link still includes
it, and because the privacy contact line prints `{{zip}}`. There is no
`hidePostalCode` flag. Do not add one back.

College Station Saturday is `8:30 AM–12:30 PM` plus a badge that says
"one Saturday per month". There is no comma between the time and the badge.
Saturday has no `machine` hours, so it is not in schema.org opening hours.
Closed days and "By appointment" are a note with no `machine` entry.

## Photos

Files live in `public/assets/img/locations/{celebration,college-station}/` and
are served from `/assets/img/locations/...`. The catalog is `src/config/photos.ts`.

A page asks for a photo id. `photoFor(location, { id })` returns that photo,
or the office's alias. WebP srcset widths are 480, 800, and 1200, plus 1800
when the photo is shown large, and never wider than the file. A JPEG whose
name ends in `-1200.jpg` becomes `-480.webp`. A name with no size suffix,
`pregnancy-care.jpg`, becomes `pregnancy-care-480.webp`. Every generated width
must be listed on the photo.

`landing-office` is the landing card and the `image` on the Chiropractor
JSON-LD. Do not add a `schemaImage` path back onto the location.

New width variants come from `make-images/make-images.py`. Put sources in
`make-images/originals/`. The script writes WebP at 480, 800, 1200, and 1800
(never wider than the source) and one JPEG fallback to `make-images/output/`,
plus `manifest.json`. It does not edit `photos.ts` or `originals/`. Copy the
files into the office folder and register them in `photos.ts` by hand. It
needs Pillow.

## Pricing and partners

`Pricing.astro` reads `location.pricing`. Each row's `values` must have one
number per tier. Community partners are the `partners` list in
`src/content/pages/partners.md`. Each partner's `locations` array names the
offices that show them. The list may be empty. The partners page
still shows its `intro`. The original partner
directory and digital business cards were templates waiting on owner data.
Do not invent partners.

Classes & Events reads each office's public Google Calendar
(`location.eventsCalendarId`). The "See What's Coming Up" section sets
`showEvents: true`. `eventsWithinDays` on `classes-events.md` is how far ahead
the cards look. The cards are a horizontal carousel: title, date, start and
end, and the description. Events that have already ended are left out. Do not
replace that with a calendar embed.

## Build and deploy

```bash
bun install
bun run dev      # http://localhost:4321
bun run build    # astro check, then dist/
```

Output is directory URLs (`/college-station/contact/index.html`). The host is
Cloudflare. `public/_redirects` is the production redirect list and includes
the slash and no-slash forms. `astro.config.mjs` holds one key per redirect
because Astro treats `/path` and `/path/` as the same route.

Fonts still load from Google Fonts. The logo and favicons are in
`public/assets/img/`.
