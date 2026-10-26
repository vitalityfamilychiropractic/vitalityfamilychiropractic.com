# Vitality Family Chiropractic

One static site for both offices. Each office has its own hours, prices, photos,
team, and booking link. Shared writing — services, page descriptions, and the
privacy policy — is written once and filled in for the office that is showing it.

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
| `/{office}/meet-our-team/` | Team, in `location.team` order |
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

Set `hidePostalCode` when the visible address and the schema.org postal address
should omit the ZIP. The map link can still include it. College Station does this.

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

The header uses `site.logo` (`/assets/img/logo.svg`). The footer wordmark is text.

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

`{{doctor}}` and `{{doctorFull}}` still work as aliases for `{{lead}}` and
`{{leadFull}}`.

A misspelled token fails the build.

Each office chooses which services it offers, and in what order, with its
`services` array. A file no office lists is not published. Facebook handles on
the site and on each office are the `sameAs` URL in JSON-LD. The pages do not
show a Facebook link.
