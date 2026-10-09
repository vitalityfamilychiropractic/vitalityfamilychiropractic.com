/**
 * Brand-wide settings. Anything here is identical across every location.
 * Per-office values live in `locations.ts`.
 */

export const site = {
  name: 'Vitality Family Chiropractic',
  legalName: 'Vitality Family Chiropractic, LLC',
  tagline: 'Premier Prenatal, Pediatric, and Family Wellness Chiropractic Care',
  description:
    'Vitality Family Chiropractic offers prenatal, pediatric, and family wellness care in Celebration, Florida and College Station, Texas. Choose your office to see hours, team, and pricing.',
  url: 'https://www.vitalityfamilychiropractic.com',
  email: 'info@vitalityfamilychiropractic.com',
  /** Measurement id used on pages that are not inside one office. */
  analyticsId: 'G-D120PL4X89',
  logo: '/assets/img/logo.svg',
  /** Raster logo for JSON-LD; Google does not treat SVG as a logo image. */
  logoRaster: '/assets/img/logo-square.png',
  /** Default Open Graph image. */
  ogImage: '/assets/img/logo.png',
  spineGraphic: '/assets/img/spine-2.webp',
  social: {
    facebook: 'vitalityfamilychiropractic',
  },
} as const;
