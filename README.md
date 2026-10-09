# Vitality Family Chiropractic

Static site for Vitality Family Chiropractic. Each office has its own hours,
prices, photos, and booking link. Shared writing — specialties, page
descriptions, values, and the privacy policy — lives in one place.

Built with [Astro](https://astro.build). Pages use the current Bootstrap layout.
Office data, layouts, and JSON-LD live in the Astro project.

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
├─ config/          files you edit
│  ├─ locations.ts    every office: address, hours, prices, photos, booking URL
│  ├─ team.ts         everyone who has a profile, including their meta description
│  ├─ values.ts       the practice values
│  ├─ site.ts         brand name, tagline, socials
│  └─ types.ts        field definitions — the build checks against these
├─ content/         shared writing
│  ├─ specialties/    one file per service page
│  └─ pages/          one file per shared page; its summary is the meta description
├─ pages/           routes; `[location]` fans out over the config
├─ components/      header, footer, hero, pricing tabs, contact form
├─ layouts/         the document shell for the site and for each office
├─ lib/             nav, structured data, practice years, content tokens
└─ styles/custom.css  the layout styles on top of Bootstrap
```

Photos and icons live in `public/assets/img/` and are served from `/assets/img/`.

## Adding a location

1. Add photos under `public/assets/img/` and point at them from the new office.
2. Add any new person in `src/config/team.ts`.
3. Copy an entry in `src/config/locations.ts` and change every field, including `slug`, `bookingUrl`, `analyticsId`, hours, and pricing.
4. Run `bun run build`.

That generates the office home, values, team, a page per team member, a page per specialty, pricing, contact, and privacy, plus sitemap entries and LocalBusiness structured data.

`pricing.rows[].values` must have one number per tier. A short row fails the build.

## Shared writing

Specialty pages, the privacy policy, and the other shared pages are Markdown in `src/content/`. Each file's `summary` is the meta description for that page at every office. A team member's profile description lives on their record in `team.ts`. Where the wording needs to name a person or place, use a token:

| Token | Becomes |
| --- | --- |
| `{{lead}}` | The office lead, e.g. `Dr. Christie` |
| `{{leadFull}}` | e.g. `Christie McLarty, DC` |
| `{{leadRole}}` | e.g. `Chiropractor` |
| `{{location}}` | e.g. `Celebration` |
| `{{city}}` / `{{state}}` | The office city / full state name |
| `{{stateAbbr}}` | Two-letter state abbreviation, e.g. `FL` |
| `{{phone}}` | The office phone number |

`{{doctor}}` and `{{doctorFull}}` still work as aliases for `{{lead}}` and `{{leadFull}}`.

A misspelled token fails the build.

Each office chooses which specialties it offers, and in what order, with its `specialties` array. A file no office lists is not published.
