# Vitality Family Chiropractic

One static site for both offices. Each office has its own hours, prices, photos,
team, and booking link. Shared writing — services, page descriptions, and the
privacy policy — is written once. Most tokens fill in for the office that is
showing the page. The privacy contact block fills from `primaryOffice`.

Built with [Astro](https://astro.build). The design is Playfair Display and Nunito Sans,
in `src/styles/site.css` and `src/styles/extras.css`. The contact page includes
a message form for a new-patient appointment request or any other note. It
posts to `/api/contact` on this site.
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
| `bun test` | Contact-form handler tests. No mail is sent. |
| `bun run pages:dev` | Serve `dist/` with the Pages Function. Run `bun run build` first. |

## Where everything lives

```
src/
├─ config/            files you edit
│  ├─ locations.ts      every office: address, hours, prices, team order, booking URL
│  ├─ photos.ts         photo catalog and per-office aliases
│  ├─ site.ts           brand name, tagline, logo, default analytics id, shop nav
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
| `/{office}/our-community/` | Community |
| `/{office}/our-community/classes-events/` | Classes and events from that office's calendar |
| `/{office}/our-community/community-partners/` | Partners whose `locations` include this office, in catalog order |
| `/{office}/our-community/community-partners/{partner}/` | One partner. Built only for offices named on that partner. |
| `/{office}/new-patients/first-visit/` | First visit |
| `/{office}/new-patients/pricing-insurance/` | Pricing and insurance |
| `/{office}/contact/` | Phone, address, map, hours, and the message form |
| `/{office}/contact/thanks/` and `/{office}/contact/error/` | Form results. Noindex, and left out of the sitemap. |
| `/{office}/shop/` | Shop. Product cards come from the `products` list in `shop.md` |
| `/{office}/privacy/` and `/privacy/` | Privacy policy |

Massage is a child of Our Care, and only at offices that list it in
`services`. Celebration does not. Shop is one item for every office, linking
to `/{office}/shop/`. Turn it on or off with `shop.inNav` in `src/config/site.ts`.
While that is false, production menus omit it and the dev server still shows
it in gray.

Old paths such as `/specialties/`, `/team/`, `/pricing/`, and `/our-values/`
redirect. Astro redirects are in `astro.config.mjs` (one key per path).
Cloudflare uses `public/_redirects`, which lists both the slash and no-slash
forms. Our Values redirects to that office's home. There is no values page.

## Contact form

Both offices post to `/api/contact`, a Cloudflare Pages Function
(`functions/api/contact.ts`, logic in `src/lib/contact.ts`). The addresses
live in `src/config/site.ts`. On the production branch, `main`, the message
goes to `CONTACT_TO` (`info@vitalityfamilychiropractic.com`). Every other
branch, including Pages previews and local `wrangler pages dev`, goes to
`PREVIEW_CONTACT_TO` (`nick@vitalityfamilychiropractic.com`). The branch is
`CF_PAGES_BRANCH`. A missing branch is treated as a preview. The body lists
the office slug, the contact page, and the submitted fields. Reply-To is the
visitor's email when that address is valid.

The subject is `Message — {office} (Vitality Family Chiropractic)`, the same
text the old form put in `_subject`. The From line is
`DEFAULT_CONTACT_FROM_NAME` (`Vitality Family Chiropractic website`) at
`DEFAULT_CONTACT_FROM_EMAIL` (`website@vitalityfamilychiropractic.com`).
`CONTACT_FROM` can still override the address, and it must stay on
`vitalityfamilychiropractic.com`. The name stays the settings value.

Pages Functions cannot use a `send_email` binding. The [Pages bindings
list](https://developers.cloudflare.com/pages/functions/bindings/) does not
include Email Sending, and the Email Sending docs say to use the REST API from
anything that is not a Worker. The function calls
`POST /accounts/{account_id}/email/sending/send`. No token is stored in the repo.

With scripting off, the browser posts the form and lands on
`/{office}/contact/thanks/` or `/{office}/contact/error/`. Those addresses are
paths only. Field values are never copied into a URL. With scripting on, the
page stays put and shows the same success or error styling it already used.
The script does not call `gtag` or `dataLayer`. The only analytics call on the
site is the existing page-view `gtag('config', …)` in `BaseLayout.astro`.

The honeypot fields and the "do not include protected health information" note
stay. A filled honeypot is not emailed. The server checks the method, the
content type, the size, required fields, lengths, the email shape, the phone
shape, and the office slug. Header characters are stripped before anything is
placed in a subject or address. Five posts from one address are accepted in
ten minutes; the sixth is refused. That counter lives in the isolate, so it
slows a burst rather than capping the whole site.

Turnstile is optional until both of its values are set. The widget is baked
into the page from `PUBLIC_TURNSTILE_SITE_KEY` at build time. The function
checks `TURNSTILE_SECRET` with siteverify, and it requires the action
`contact` and a hostname of `www.vitalityfamilychiropractic.com` or
`vitalityfamilychiropractic.com`, plus the hostname of the request itself,
so a Pages preview matches without an extra variable. `TURNSTILE_HOSTNAMES`
adds more hostnames. It does not remove the production ones. A normal
browser post, with scripting off, still sends, because Turnstile cannot issue
a token without JavaScript. A scripted post is refused until the token checks
out.

### What to set in the Cloudflare dashboard

Do this before the form can deliver mail. Nothing below belongs in git.

1. The domain `vitalityfamilychiropractic.com` must use Cloudflare DNS.
2. Onboard it for Email Sending: Compute > Email Service > Email Sending >
   Onboard Domain. Cloudflare adds bounce MX, SPF, and DKIM on the
   `cf-bounce` subdomain. Those records do not replace the domain's inbound
   MX, so an existing inbox (Google Workspace or anything else) keeps
   receiving mail. A DMARC record at `_dmarc` is added only when the domain
   does not already have one. If other services also send mail for the
   domain, leave an existing DMARC policy alone, or start at `p=none` until
   every sender passes SPF or DKIM. Confirm the records under Email Sending >
   Settings. Details are in the [domain configuration
   guide](https://developers.cloudflare.com/email-service/configuration/domains/).
3. Create an API token at My Profile > API Tokens > Create Token > Custom
   token. Permission: Account, Email Sending, Edit. Limit it to the account
   that owns the domain.
4. Open the Pages project > Settings > Environment variables. Add the same
   runtime values for Production and Preview:
   - `EMAIL_API_TOKEN`, secret: the token from step 3.
   - `CLOUDFLARE_ACCOUNT_ID`, secret or plain text: the account id from the
     dashboard overview URL (`https://dash.cloudflare.com/<account-id>`).
     It is 32 hex characters.
   - `CONTACT_FROM`, optional plain text. Overrides the From address only.
     The default is `website@vitalityfamilychiropractic.com` in
     `src/config/site.ts`. Any override must be an address at
     `vitalityfamilychiropractic.com`. The From name is not an environment
     variable. It is `Vitality Family Chiropractic website` in that same file.
5. Sending to an arbitrary recipient needs the Workers Paid plan once the
   domain is onboarded for Email Sending. On every plan, including Workers
   Free, mail to a verified destination address is allowed and does not count
   toward the sending quota. Verify both inboxes if the account is not on
   Workers Paid, or if you want those messages excluded from the quota:
   `info@vitalityfamilychiropractic.com` (production, the `main` branch) and
   `nick@vitalityfamilychiropractic.com` (every preview branch). Compute >
   Email Service > Email Routing > Destination addresses. Enter each address
   and open the verification email it receives. Verifying a destination does
   not change MX records. Do not turn on Email Routing for the domain if
   inbound mail already uses another provider's MX records. Routing would
   take over delivery. There is no dashboard variable for the recipient. The
   two addresses are `CONTACT_TO` and `PREVIEW_CONTACT_TO` in
   `src/config/site.ts`.
6. Redeploy the Pages project after the variables are saved. Functions read
   them on the next deployment.

Turnstile, when you want it:

1. Turnstile > Add widget. Widget mode: Managed. Hostnames:
   `www.vitalityfamilychiropractic.com` and `vitalityfamilychiropractic.com`.
   Add a preview hostname on the widget if the challenge should run there.
   The function already accepts the hostname of the request, so
   `TURNSTILE_HOSTNAMES` is only for additional hosts. Do not put `localhost` on the production widget.
2. Pages > Settings > Environment variables:
   - `PUBLIC_TURNSTILE_SITE_KEY`, plain text, available to the **build**. The
     site key is public. Astro writes it into the form. A new deploy is
     required after it changes.
   - `TURNSTILE_SECRET`, secret, **runtime** only. Production and Preview.
3. Redeploy. Until both values are present, the form still sends and the
   widget is hidden. After the secret is present, a scripted submit without a
   valid token is refused.

Local mail needs the same names in `.dev.vars` (gitignored) next to
`package.json`. `bun test` does not send mail. `bun run build` then
`bun run pages:dev` serves the built site and the function. A post without
those variables returns the "not ready" error.

## Adding a location

1. Add photos under `public/assets/img/locations/{slug}/` and register them in `src/config/photos.ts`.
2. Add any new person as `src/content/team/{slug}.md`. The team schema is strict.
3. Copy an entry in `src/config/locations.ts` and change every field, including `slug`, `bookingUrl`, `analyticsId`, hours, pricing, `services`, `team`, and `lead`.
4. To show a community partner at the new office, add its slug to that partner's `locations` array in `src/content/pages/partners.md`. An unknown office slug fails the build.
5. Run `bun run build`.

That generates the office home, team, a page per service the office lists,
community, classes and events, the partners index, a profile for each partner
whose `locations` include the office, shop, first visit, pricing, contact, and
privacy, plus sitemap entries and Chiropractor structured data.

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
| `partners.md` | `/{office}/our-community/community-partners/`. The `partners` list is the catalog. Each partner's `locations` array names the offices that show them. |
| `contact.md` | `/{office}/contact/` |
| `team.md` | `/{office}/meet-our-team/` (title and summary only; bios are team files) |
| `pricing.md` | `/{office}/new-patients/pricing-insurance/` (title and summary only; numbers come from the office) |
| `shop.md` | `/{office}/shop/`. The `products` list is the catalog. |
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
| `intro` | The partners page and the shop page. Shown even when that list is empty |
| `partners` | Community partner catalog on `partners.md`. Each partner has slug, `locations`, name, profession, summary, and optional business, phone, email, and website. `locations` is the office slugs where that partner appears. Catalog order is the order on the page. |
| `products` | Shop catalog on `shop.md`: name, description, price, image, and the store link. Images live in `public/assets/img/shop/`. |
| `eventsWithinDays` | Classes & Events. How many days ahead to show from `eventsCalendarId` |
| `sections` | Home, first visit, community, classes, and every service page |

A service file also needs `navLabel`, `order`, `cardTitle`, `cardText`, and
`cardImage` (a photo id). `cardSoft` gives that home-page card the softer
background. `order` sorts the service pills on the brand landing page. The
office menu follows `location.services`.

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
