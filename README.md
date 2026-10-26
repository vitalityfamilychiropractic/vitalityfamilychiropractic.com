# Vitality Family Chiropractic

One static site for both offices. Each office has its own hours, prices, photos,
team, and booking link. Shared writing — services, page descriptions, and the
privacy policy — is written once. Most tokens fill in for the office that is
showing the page. The privacy contact block fills from `primaryOffice`.

Built with [Astro](https://astro.build). The design is Fraunces and Nunito Sans,
in `src/styles/site.css` and `src/styles/extras.css`. There is no contact form.
"Call to Schedule" buttons dial the office. Each office's booking link goes to
its own Jane App site.

`/` is the brand landing page: a short introduction and one card per office.
The card names that office's lead and shows the `landing-office` photo. In
local dev and in `bun run build`, `/` is that page and it is included in the
sitemap. On Cloudflare, `public/_redirects` sends `/` to `/college-station/`.
Astro does not apply `_redirects`.

## Quick start

Requires [Bun](https://bun.sh) 1.2 or newer.

```bash
bun install
bun run dev
```

Then open the URL Astro prints (port 4321 by default).

| Command | What it does |
| --- | --- |
| `bun run dev` | Local dev server with hot reload |
| `bun run build` | Type-check, then build to `dist/` |
| `bun run preview` | Serve the built `dist/` |

## Where everything lives

```
src/
├─ config/            files you edit
│  ├─ locations.ts      every office: address, hours, prices, team order, booking URL
│  ├─ photos.ts         photo catalog and per-office aliases
│  ├─ partners.ts       community partners (the list may be empty)
│  ├─ site.ts           brand name, tagline, logo, default analytics id
│  └─ types.ts          field definitions — the build checks against these
├─ content/           shared writing
│  ├─ services/         one file per Our Care page
│  ├─ team/             one file per person; display order is location.team only
│  └─ pages/            one file per shared page; its summary is the meta description
├─ pages/             routes; `[location]` fans out over the config
├─ components/        header, footer, hours, pricing, page blocks
├─ layouts/           the document shell for the site and for each office
├─ lib/               nav, structured data, content tokens
└─ styles/            site.css, then extras.css
```

Photos, the logo, and favicons live in `public/assets/img/` and are served from
`/assets/img/`. Office photos are under `public/assets/img/locations/`.

## Routes

Each office is a directory under its slug.

| Path | Page |
| --- | --- |
| `/` | Brand landing page |
| `/{office}/` | Office home |
| `/{office}/our-care/{service}/` | A service, such as prenatal or massage-therapy |
| `/{office}/meet-our-team/` | Team, in `location.team` order. On a wide screen the portrait switches sides for each person. |
| `/{office}/our-community/` | Community, plus classes and partners |
| `/{office}/new-patients/first-visit/` | First visit |
| `/{office}/new-patients/pricing-insurance/` | Pricing and insurance |
| `/{office}/contact/` | Phone, address, map, hours |
| `/{office}/privacy/` and `/privacy/` | Privacy policy |

Massage is a child of Our Care, and only at offices that list it in
`services`. Celebration does not. Shop stays in the College Station menu as a
label with no link while `shop.href` is null.

Old paths such as `/specialties/`, `/team/`, `/pricing/`, and `/our-values/`
redirect. Astro redirects are in `astro.config.mjs` (one key per path).
Cloudflare uses `public/_redirects`, which lists both the slash and no-slash
forms. Our Values redirects to that office's home. There is no values page.

## Adding a location

1. Add photos under `public/assets/img/locations/{slug}/` and register them in `src/config/photos.ts`.
2. Add any new person as `src/content/team/{slug}.md`. The team schema is strict.
3. Copy an entry in `src/config/locations.ts` and change every field, including `slug`, `bookingUrl`, `analyticsId`, hours, pricing, `services`, `team`, and `lead`.
4. Run `bun run build`.

That generates the office home, team, a page per service the office lists,
community, first visit, pricing, contact, and privacy, plus sitemap entries
and Chiropractor structured data.

`pricing.rows[].values` must have one number per tier. A short row fails the build.

`team` is the only display order. Do not put an order field on the person.
`lead` is who shared prose calls `{{lead}}`, and whose name the landing card uses.

The visible address and the schema.org postal address omit the ZIP. The map
link can still include it. Keep `address.zip` for that.

## Photos

`src/config/photos.ts` is the catalog. A page asks for a photo id. `photoFor`
returns that photo, unless the office's `photoAliases` maps the id to another
one. The substitute keeps its own crop. Use an alias when an office should not
show a College Station interior or staff photo.

`landing-office` is the brand landing card and the `image` on each office's
Chiropractor JSON-LD. Point that alias at the photo the office should show.

Most files ship as WebP at 480, 800, and 1200 pixels wide, and at 1800 when the
photo is shown large. The JPEG named in `src` is the fallback. Widths are never
larger than the original. A file whose name already ends in `-1200.jpg` becomes
`-480.webp` in the srcset. A file with no size suffix, such as
`pregnancy-care.jpg`, becomes `pregnancy-care-480.webp`. List every width you
generate in the photo's `widths` array.

The header uses `site.logo` (`/assets/img/logo.svg`). The footer uses the same
logo, covered in white so it reads on the dark background.

To make the width variants, put source photos in `make-images/originals/` and
run `python3 make-images/make-images.py`. The script needs Pillow. It leaves
`originals/` and `photos.ts` alone. Exports go to `make-images/output/`: WebP
at 480, 800, 1200, and 1800 (never wider than the source) and one JPEG fallback
at `min(1200, source width)`. `output/manifest.json` lists each slug, its
widths, and the fallback name. Copy the files into
`public/assets/img/locations/{office}/` and add the entry in `photos.ts` by
hand. A filename becomes the slug: lowercase, with anything that is not a
letter or digit turned into a hyphen. Two files that would share a slug stop
the script.

While `bun run dev` is running, hover a catalog photo to see its id. An aliased
photo also names the id the page asked for. That label is left out of the
production build.

## Hours

Each day has `blocks` for the visible times. A closed day uses an empty
`blocks` array and a `note` such as `Closed`. A `note` next to real times is a
small badge after the times, with no comma between them. College Station
Saturday is `8:30 AM–12:30 PM` plus `one Saturday per month`.

`machine` is the 24-hour range that goes into schema.org. Leave it off for
closed days, by-appointment days, and display-only days. Saturday at College
Station has no `machine` entry, so it stays out of the structured data.

## Shared writing

Service pages, the privacy policy, and the other shared pages are Markdown in
`src/content/`. Each file's `summary` is the meta description for that page at
every office. The home summary ends with `{{homeBlurb}}`, and that same
sentence is the description in the office's JSON-LD. A person's name, role,
portrait, and bio live in their team file.

Where the wording needs to name a person or place, use a token:

| Token | Becomes |
| --- | --- |
| `{{lead}}` | The office lead, e.g. `Dr. Christie` |
| `{{leadFull}}` | e.g. `Christie McLarty, DC` |
| `{{leadRole}}` | e.g. `Chiropractor` |
| `{{location}}` | e.g. `Celebration` |
| `{{city}}` / `{{state}}` | The office city / full state name |
| `{{stateAbbr}}` | Two-letter state abbreviation, e.g. `FL` |
| `{{phone}}` | The office phone number, as displayed |
| `{{phoneHref}}` | A `tel:` link, e.g. `tel:+14075847900` |
| `{{base}}` | The office prefix, e.g. `/celebration` |
| `{{bookingUrl}}` | That office's Jane App URL |
| `{{homeClaim}}` | First paragraph of the home "family" section |
| `{{homeBlurb}}` | Sentence appended to the home description |
| `{{insuranceFaq}}` | The first-visit insurance answer, as HTML |

A misspelled token fails the build.

The privacy policy uses a separate set. `primaryOffice` in
`src/content/pages/privacy.md` names the office, and both `/privacy/` and
`/{office}/privacy/` fill the contact block from that office. An office privacy
page still uses `summary` (with the usual tokens) as its meta description.
`/privacy/` uses `brandSummary`.

| Token | Becomes |
| --- | --- |
| `{{formatStreet}}` | Street and suite, e.g. `3012 Barron Road, Suite 300` |
| `{{formatCityLine}}` | City and state abbreviation, e.g. `College Station, TX` |
| `{{zip}}` | `address.zip`, for this contact line |
| `{{email}}` | That office's email |
| `{{telHrefFormatted}}` | The phone with spaces, e.g. `+1 979 703 7977` |

`telHrefFormatted` is the display form of `telHref`. Links keep the compact
form, such as `tel:+19797037977`. A trailing backslash on a contact line keeps
that line on its own row. The policy body only accepts the tokens in this
table. Visible addresses and schema.org still omit the ZIP. The contact line
prints it because the copy includes `{{zip}}`.

Each office chooses which services it offers, and in what order, with its
`services` array. A file no office lists is not published. Facebook handles on
the site and on each office are the `sameAs` URL in JSON-LD. The pages do not
show a Facebook link.

## Page front matter

Shared pages live in `src/content/pages/`. The file name is the id the route
loads. Service pages live in `src/content/services/` and use the same `sections`
list. A string in the front matter may contain tokens and inline HTML.

| File | Route |
| --- | --- |
| `home.md` | `/{office}/` |
| `first-visit.md` | `/{office}/new-patients/first-visit/` |
| `community.md` | `/{office}/our-community/` |
| `classes-events.md` | `/{office}/our-community/classes-events/`. `eventsWithinDays` limits the calendar. A centered section with `showEvents: true` lists that office's public Google Calendar under its copy. |
| `partners.md` | `/{office}/our-community/community-partners/` |
| `contact.md` | `/{office}/contact/` |
| `team.md` | `/{office}/meet-our-team/` (title and summary only; bios are team files) |
| `pricing.md` | `/{office}/new-patients/pricing-insurance/` (title and summary only; numbers come from the office) |
| `privacy.md` | `/{office}/privacy/` and `/privacy/`. The Markdown body is the policy. The contact block is filled from `primaryOffice`. |
| `services/{id}.md` | `/{office}/our-care/{id}/` |

Every page and service file needs `title` and `summary`. `summary` is the meta
description. These fields are optional, and only some routes read them:

| Field | Used by |
| --- | --- |
| `brandSummary` | `/privacy/`, because `summary` names a city. It must not contain a token. |
| `updated` | The "Updated …" line on the privacy policy |
| `primaryOffice` | Location slug for the privacy contact block, on every privacy URL |
| `asideTitle`, `aside` | The contact page. Both are required there. |
| `intro` | The partners page, shown even when the partner list is empty |
| `eventsWithinDays` | Classes & Events. How many days ahead to show from `eventsCalendarId` |
| `sections` | Home, first visit, community, classes, and every service page |

A service file also needs `navLabel`, `order`, `cardTitle`, `cardText`, and
`cardImage` (a photo id). `cardSoft` gives that home-page card the softer
background. `order` is the menu order.

A team file is one person. The schema is strict.

| Field | |
| --- | --- |
| `name`, `shortName`, `role` | Display name, `{{lead}}` name, and job title |
| `schemaType` | `Physician` or `Person` |
| `tagline` | Italic line under the heading. Optional. |
| `factsTitle`, `facts` | The numbered list. Each fact is HTML. |
| `photo` | Photo id. Omit it and the page shows initials. |
| `credentials`, `email` | Optional. Credentials are appended to the full name. |

The Markdown body under the team front matter is the bio.

`sections` is a list. Each item needs `kind`. An unknown kind renders nothing.
Text fields are `heading`, `sub`, `flow`, `paragraphs`, and `ctas`. Photo
fields are `image`, `image2`, and `bloom`, each `{ id, position }`. `id` is a
photo id. `position` is an optional CSS object-position, such as `55% 30%`.

A `flow` item is `{ kind, text }`. If `text` already contains a `<p>` tag, it
is inserted as written. Otherwise the kind is the paragraph's class:

| Flow kind | Result |
| --- | --- |
| `p` | A normal paragraph |
| `lead` | The larger opening line |
| `claim` | A paragraph. `<strong>` inside it gets the highlight |
| `quip` | An italic pull line |
| `signoff` | An italic closing line |
| anything else | A paragraph with that kind as its class |

A button is `{ label, href, action, ghost }`. `action: phone` dials the office
(`href` is usually `{{phoneHref}}`). `action: url` is a normal link. `ghost:
true` draws the outline button.

### Section kinds

`hero`. Home opening. `heading` is the h1. `flow`, `ctas`, `image` (the arch),
and `bloom` (the small photo overlapping it).

`family`. Two photos beside the copy. `heading`, `flow`, `image`, `image2`.

`care`. The office's service cards. `heading`, `paragraphs`, `sub` (a smaller
heading above the cards), and `ctas`. Card text and photos come from each
service file, not from this section.

`best`. Copy on the right, a tall arch and a round photo on the left.
`heading`, `flow`, `image`, `image2`.

`community`. Two photos in a mosaic, then copy. `heading`, `flow`, `ctas`,
`image`, `image2`.

`closing`. A centered card. `heading`, `flow`, `ctas`, `image`. Without
`soft`, the image is the full-bleed background and the card shows a sprig.
With `soft: true`, the image sits inside the card.

`intro`. Interior-page opening. `heading` is the h1. `sub`, `flow`, `ctas`,
`image`, `bloom`. `band` adds a strip under the opening:

| `band.kind` | |
| --- | --- |
| `trio` | `band.items`, a list of `{ text }`, each with a sprig |
| `story` | `band.flow`, the same flow items as anywhere else |

`split`. Copy beside one photo. `heading`, `flow`, `ctas`, `image`.

| Option | |
| --- | --- |
| `frame` | `tall` (a tall arch), `arch`, or omit it for a rectangle |
| `tone` | `slate`, `paper`, or omit it for the default background |
| `reverse` | Puts the photo on the right |
| `solo` | Drops the photo column and centers the copy |

`centered`. A sprig, then `heading`, `flow`, and `ctas`.

`note`. A boxed note. `heading` and `flow`.

`topics`. A heading, optional `paragraphs`, then `items`. Set `columns: 3` for
three columns. Each item has `heading` and `paragraphs`. `image` adds a photo.
`wide: true` uses the photo layout even when there is no image.

`page-hero`. A centered sprig and h1. Only `heading`.

```yaml
---
title: "Your First Visit"
summary: "What to expect at your first visit in {{city}}, {{stateAbbr}}."
sections:
  - kind: "intro"
    heading: "Come on in."
    sub: "We'll take it from here."
    flow:
      - kind: "lead"
        text: "Your first visit in {{city}} is unhurried."
      - kind: "p"
        text: "Call us at {{phone}} and we'll find a time."
    ctas:
      - label: "Call to Schedule"
        action: "phone"
        href: "{{phoneHref}}"
    image:
      id: "office-reception"
  - kind: "split"
    heading: "What happens next"
    reverse: true
    frame: "arch"
    flow:
      - kind: "p"
        text: "We listen first."
    image:
      id: "prenatal-visit"
      position: "50% 30%"
---
```
