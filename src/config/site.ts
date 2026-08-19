/**
 * Brand-wide settings. Anything here is identical across every location.
 * Per-office values live in `locations.ts`.
 */

export const site = {
  name: 'Vitality Family Chiropractic',
  shortName: 'Vitality Family Chiropractic',
  legalName: 'Vitality Family Chiropractic, LLC',
  tagline: 'Premier Prenatal, Pediatric, and Family Wellness Chiropractic Care',
  description:
    'A community based wellness center helping families achieve a better quality of life through premier prenatal, pediatric, and family wellness chiropractic care.',
  url: 'https://www.vitalityfamilychiropractic.com',
  email: 'info@vitalityfamilychiropractic.com',
  logo: '/img/brand/logo.svg',
  /** Raster logo for JSON-LD; Google does not treat SVG as a logo image. */
  logoRaster: '/img/brand/logo-square.png',
  /** Default Open Graph image (1200×630). */
  ogImage: '/img/brand/og.png',
  spineGraphic: '/img/brand/spine.webp',
  social: {
    facebook: 'https://www.facebook.com/vitalityfamilychiropractic',
  },
  /** Shown in the footer next to the copyright. */
  copyrightStart: 2011,
} as const;

/*
 * Specialties are not listed here. Each one is a Markdown file in
 * `src/content/specialties/` carrying its own title and summary, and each
 * office picks the ones it offers via its `specialties` array in
 * `locations.ts` — so the set can differ between offices. Resolve them with
 * the helpers in `src/lib/specialties.ts`.
 */
