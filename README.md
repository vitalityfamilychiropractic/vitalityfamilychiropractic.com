# Vitality Family Chiropractic

A static site for Vitality Family Chiropractic. Every office gets what feels
like its own website — its own team, photos, prices, hours and booking link —
while all the shared writing lives in exactly one place.

Built with [Astro](https://astro.build). No JavaScript framework runs in the
browser; the only client-side script is ~2 KB for the menu and the contact form.

---

## Quick start

Requires [Bun](https://bun.sh) 1.2 or newer (`brew install oven-sh/bun/bun`, or
`curl -fsSL https://bun.sh/install | bash`).

```bash
bun install
```

```bash
bun run dev
```

Then open <http://localhost:4321>.

| Command | What it does |
| --- | --- |
| `bun run dev` | Local dev server with hot reload |
| `bun run build` | Type-check, then build to `dist/` |
| `bun run preview` | Serve the built `dist/` exactly as it will deploy |

`bun run build` runs `astro check` first, so a typo in the config fails the
build with the field name instead of publishing a broken page.

`bun.lock` is committed — it pins the exact dependency tree, so every machine
and every deploy builds from the same versions. Commit it whenever you change a
dependency.

---

## Adding a new location

This is the whole process. **No template, route or component file changes.**

### 1. Add the photos

Create `public/img/locations/<slug>/` containing:

| File | What it is | Suggested size |
| --- | --- | --- |
| `portrait-cutout.png` | Office lead, **transparent background** — floats on the home page hero | ~720 × 720 |
| `portrait-studio.jpg` | Office lead, normal photo — framed on the "why choose" card | ~552 × 820 (portrait) |
| one photo per specialty | e.g. `pregnancy-care.jpg` — used on that page and card | square, ≥960 px |

A specialty photo is optional. Without one the card and page show a tinted
panel instead, so a service can go live before the photography does.

### 2. Add the people (only if they are new)

Open `src/config/team.ts` and copy an existing entry. Someone who works at
more than one office is defined **once** here and listed in both offices'
`team` arrays — there is never a second copy of a bio to keep in sync.

Note `practiceStartDate` rather than a years count — see
[Years in practice](#years-in-practice).

### 3. Add the office

Open `src/config/locations.ts`, copy an existing entry, and change every field.
The ones that are easy to miss:

- `slug` — becomes the URL (`/winter-park/`). Lowercase, hyphens only.
- `bookingUrl` — **this office's own** Jane App site.
- `form.accessKey` — this office's own form key (see below).
- `geo` — latitude and longitude, used for local SEO. Right-click the pin in
  Google Maps and the coordinates are the first item in the menu.
- `specialties` — which service pages this office offers, in menu order. See
  [Specialties](#specialties).
- `lead` — whose portrait, signature, "Why choose …" panel and specialty cards
  the office runs on. Their `highlights` and `passions` come with them; there is
  nothing to copy per office.
- `pricing.rows` — each row's `values` array must have exactly as many numbers
  as there are `tiers`, or the build stops and tells you which row is short.
- `hours` — `blocks` is what visitors read, `machine` is what Google reads.
  Keep them in step. Closed and by-appointment days use `note` and no `machine`.

Array order is display order, both in the office switcher and on the front page.

### 4. Build

```bash
bun run build
```

That generates the whole site for the new office: home, values, team, a page
per team member, a page per specialty it offers, pricing, contact and privacy — plus
its sitemap entries, its `LocalBusiness` structured data, and its cards in the
front-page chooser, the office switcher and every footer.

---

## Where everything lives

```
src/
├─ config/          ← the files you edit
│  ├─ locations.ts    every office: address, hours, prices, photos, booking URL
│  ├─ team.ts         everyone: bio, role, credentials, practice mix
│  ├─ values.ts       the practice values
│  ├─ site.ts         brand name, tagline, socials
│  └─ types.ts        field definitions — the build checks against these
│
├─ content/         ← the writing; each office picks what it uses
│  ├─ specialties/    one file per service page (the shared pool)
│  └─ pages/          privacy.md
│
├─ pages/           ← routes; `[location]` fans out over the config
├─ components/      ← header, footer, hero, pricing table, contact form…
├─ layouts/         ← page shells
└─ styles/
   ├─ tokens.css      every colour, size and shadow — change the brand here
   ├─ fonts.css       self-hosted Inter + Lora
   └─ global.css      reset, typography, buttons, layout helpers
```

### Editing the shared writing

Specialty pages and the privacy policy are Markdown in `src/content/`. Edit one
file and every office that uses it updates.

Where a shared page needs to name a person or place, use a token:

| Token | Becomes |
| --- | --- |
| `{{lead}}` | The office's lead, e.g. `Dr. Christie` |
| `{{leadFull}}` | e.g. `Christie McLarty, DC` |
| `{{leadRole}}` | e.g. `Chiropractor` |
| `{{location}}` | e.g. `Celebration` |
| `{{city}}` / `{{state}}` | The office's city / state |
| `{{phone}}` | The office's phone number |

`{{doctor}}` and `{{doctorFull}}` still work as aliases for `{{lead}}` and
`{{leadFull}}`, but prefer the newer names — an office lead need not be a
doctor.

So one sentence in `pregnancy-care.md` reads "Dr. Christie is certified in the
Webster technique" in Celebration and "Dr. Ashley…" in College Station. A
misspelled token fails the build rather than printing `{{docter}}` on the page.

---

## Specialties

Specialty pages are a **shared pool that each office draws from**, not a fixed
list. Every file in `src/content/specialties/` is available to any office, and
each office's `specialties` array decides which ones it offers and in what
order:

```ts
// Celebration
specialties: ['pregnancy-care', 'pediatric-care', 'family-wellness-care'],

// College Station — also offers massage therapy
specialties: [
  'pregnancy-care',
  'pediatric-care',
  'family-wellness-care',
  'massage-therapy',
],
```

That single array drives the Specialties menu, the cards on the home page, the
"explore our other specialties" row, the generated routes and the sitemap. A
service only one office provides simply appears in one office's array — there
is nothing to special-case.

### Adding a service to one office

1. **Write the page.** Create `src/content/specialties/<slug>.md` with
   frontmatter `title`, `summary`, `order`, and optionally `standfirst`. Body
   copy can use the same `{{lead}}` / `{{location}}` tokens as any other
   shared page.
2. **List it.** Add the slug to that office's `specialties` array in
   `src/config/locations.ts`.
3. **Add a photo (optional).** Put it in that office's
   `images.specialties['<slug>']`, with alt text in `images.specialtiesAlt`.
   Without one the card and page fall back to a tinted panel.
4. `bun run build`.

To take a service away from an office, remove the slug from its array. To retire
it everywhere, remove it from every array — the Markdown file can stay in the
repo as a draft, since a file no office lists is never published.

Slugs that don't match a file fail the build with the list of valid ones, so a
typo can't produce a menu item pointing at a 404.

> **`massage-therapy.md` currently holds draft copy** written to demonstrate the
> feature. Replace it with your own wording — or drop the slug from College
> Station's array — before the site goes live.

### Who the specialty page's card names

Each specialty page carries a card in the sidebar. By default it names the
office's `lead` and heads itself from that person's `role` — "Your
chiropractor".

A service the lead does not personally deliver can point somewhere else, per
office, via `specialtyLeads`:

```ts
// College Station
specialtyLeads: {
  'massage-therapy': { member: 'jane-doe' },
},
```

That is enough: because `jane-doe` has `role: 'Massage Therapist'` in
`team.ts`, the card heads itself "Your massage therapist" automatically. Add
`label: '…'` alongside `member` only when you want wording the role does not
give you.

Anything not listed in `specialtyLeads` keeps the office's usual lead, so only
the exceptions need configuring.

> The College Station massage page currently points at Dr. Christie with an
> explicit label, purely so the mechanism is visible in a live page. Swap
> `member` for the real therapist once they are in `team.ts`, and delete the
> `label` — the role will supply it.

---

## The team

`src/config/team.ts` holds everyone the site names anywhere. Nobody has to be a
chiropractor, and **how much you have to fill in depends on `schemaType`.**

### `schemaType: 'Physician'` — a licensed clinician

They appear on team pages and get a full profile, so everything that page
renders is required: `credentials`, `certifications`, `specialty`, `photo`,
`bio`, `practiceMix`, `priorities` and `community`. Leave one out and the build
stops rather than publishing a half-empty profile.

### `schemaType: 'Person'` — everyone else

A massage therapist, an assistant, the front desk. They get named where they
are relevant — a specialty card, say — without needing a profile's worth of
material, so **all of those fields are optional.** Candice is the example:

```ts
{
  slug: 'candice-ashburn',
  name: 'Candice Ashburn',
  shortName: 'Candice',
  credentials: 'LMT',
  role: 'Massage Therapist',
  schemaType: 'Person',
  practiceStartDate: '2000-01-01',
  email: 'candice@vitalityfamilychiropractic.com',
}
```

Every page skips what is missing — no empty headings, no broken images, no
stray "Certifications:" with nothing after it. Fill any field in later and it
simply starts appearing.

### Required of everyone

`slug`, `name`, `shortName`, `role`, `schemaType`, `practiceStartDate`, `email`.

### Optional for everyone

| Field | What it does |
| --- | --- |
| `signature` / `signatureAlt` | Handwritten signature under the home page greeting. Only an office `lead` is ever greeted, so nobody else needs one. |
| `highlights` | "Experience" bullets for the "Why choose …" panel. |
| `passions` | "Passions" chips for the same panel. |

`highlights` and `passions` describe a person rather than a building, so they
live here and an office picks them up by naming that person as its `lead`.
Change Dr. Ashley's certifications once and every office she leads updates.
The panel skips whichever section is empty rather than leaving a heading over
nothing.

### Appearing on a team page, or not

Team pages are generated from each location's `team` array — **not** from this
file. Someone referenced only by `specialtyLeads` is named on that specialty's
card but gets no profile page, and the card renders their name as plain text
rather than linking somewhere that does not exist. That is how Candice is set
up: responsible for a specialty, not listed among the doctors.

Someone who works at two offices is defined **once** and listed in both
offices' `team` arrays. They get a page under each office, so the phone number,
booking link and navigation always belong to the office being browsed — from a
single bio.

---

## Years in practice

`team.ts` stores `practiceStartDate` (an ISO `YYYY-MM-DD` date), not a number
of years. The years figure is derived in two places:

- **At build time**, so the HTML contains a real number for search engines and
  for anyone with scripting disabled.
- **On page load**, by a small script in `PracticeYears.astro` that re-derives
  it from today's date.

The second pass matters because a static page can sit on a CDN edge — or simply
go unrebuilt — for a long time, and "14 years" would quietly become wrong on the
anniversary. The number now corrects itself the moment someone opens the page,
and nobody has to remember to edit it.

Only completed years count: a 1 September start reads "13 years" until
1 September, then "14".

---

## Setting up the contact form

The site is static, so form submissions go to a third-party service. It is
configured for [Web3Forms](https://web3forms.com) (free, no account needed).

1. Enter the office's email at <https://web3forms.com> — they send an access key.
2. Paste it into that office's `form.accessKey` in `src/config/locations.ts`.
3. Repeat per office, so each one's enquiries go to the right inbox.

Until a real key is in place, the contact page shows a visible notice and points
visitors at the office's email address, so nothing silently disappears.

To use a different provider, change `form.endpoint` too. Any service that
accepts a `multipart/form-data` POST and returns JSON will work; the form posts
`name`, `email`, `phone`, `contact_method`, `comments` and `location`.

The form also works with JavaScript disabled — it falls back to a normal browser
form submission.

---

## Design system

Everything visual resolves to a token in `src/styles/tokens.css`. Change a value
there and it updates across the site.

### Colour and contrast

The brand blues are lighter than WCAG's minimum for body text, so the palette
splits them in two:

| Token | Value | On white | Used for |
| --- | --- | --- | --- |
| `--vfc-blue` | `#6788cf` | 3.29:1 | Large headings, icons, borders, decorative fills **only** |
| `--vfc-blue-ink` | `#3f5eab` | 5.72:1 | Links, small text, button fills |
| `--vfc-gray` | `#5f7e9c` | 4.06:1 | Decorative use only |
| `--vfc-gray-ink` | `#47617a` | 5.53:1 | Secondary text |
| `--ink` | `#14181d` | 16.9:1 | Body text |

The brand blues still set the tone — they carry the display headings, rules and
tints — but anything a visitor has to *read* uses the darker pair. Buttons are
filled with `--vfc-blue-ink` rather than `--vfc-blue`, because white on
`#6788cf` is only 3.29:1.

### Accessibility

Built to WCAG 2.1 Level AA:

- Skip link, correct landmarks, one `<h1>` per page, ordered headings.
- Menus are native `<details>` disclosures — keyboard-operable, and they work
  with JavaScript disabled. The mobile menu only *collapses* when scripting is
  available, so it can never be stuck shut behind a dead button.
- Hours and pricing are real tables with captions and scoped headers. Pricing
  scrolls sideways on narrow screens inside a focusable, labelled region.
- Every photo has descriptive alt text; decorative art is hidden from
  assistive tech.
- The contact form has visible labels, autocomplete hints, inline errors tied to
  their fields, and a live region for the result.
- Visible focus ring on everything, 44px minimum targets, usable at 320px wide
  and at 200% zoom.

Verified with axe-core (WCAG 2.0/2.1 A + AA + best practice) across every page
type at both offices: zero violations.

To re-run the audit after changes, start `bun run dev` and point an axe runner
at it — the browser extension is the quickest, or the CLI below if you have
Chrome and ChromeDriver installed locally:

```bash
bunx @axe-core/cli http://localhost:4321/celebration/ --tags wcag2a,wcag2aa,wcag21a,wcag21aa
```

---

## Deploying

`bun run build` produces a plain `dist/` folder — deployable to Netlify,
Cloudflare Pages, Vercel, GitHub Pages, or any static host.

- **Build command:** `bun run build`
- **Publish directory:** `dist`

Set `site` in `astro.config.mjs` to the live domain; canonical URLs, the sitemap
and structured data are all generated from it.

### Redirects worth adding

Most paths are unchanged from the current site, so existing search rankings
carry over. Two groups need redirecting:

**Root-level pages.** The current site mirrors its College Station pages at the
root. The new root is the office chooser, so point the rest at College Station:

```
/our-values      /college-station/our-values/   301
/team            /college-station/team/         301
/pricing         /college-station/pricing/      301
/contacts        /college-station/contact/      301
```

**The contact page**, which is now singular:

```
/celebration/contacts       /celebration/contact/       301
/college-station/contacts   /college-station/contact/   301
```

Leave `/` alone — it now serves the chooser rather than redirecting.
