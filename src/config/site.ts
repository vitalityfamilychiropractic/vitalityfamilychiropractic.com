/**
 * Brand-wide settings. Anything here is identical across every location.
 * Per-office values live in `locations.ts`.
 *
 * Contact-form mail uses the constants below. The Pages Function imports them.
 * Production is the `main` branch. Every other branch, including previews and
 * local `wrangler pages dev`, uses the preview inbox.
 */

/** Cloudflare Pages production branch. Preview branches are everything else. */
export const PRODUCTION_BRANCH = 'main';

/**
 * Menu items with `inNav: false` still appear on the dev server and on a
 * Cloudflare Pages build of any branch other than `main`. A local production
 * build does not set `CF_PAGES_BRANCH`, so those items stay out of the menu.
 */
export function showOffNav(dev: boolean, branch: string | undefined): boolean {
  if (dev) return true;
  return typeof branch === 'string' && branch.length > 0 && branch !== PRODUCTION_BRANCH;
}

/** Inbox for contact-form mail when `CF_PAGES_BRANCH` is `main`. */
export const CONTACT_TO = 'info@vitalityfamilychiropractic.com';

/** Inbox for contact-form mail on any non-production branch. */
export const PREVIEW_CONTACT_TO = 'nick@vitalityfamilychiropractic.com';

/** From address. `CONTACT_FROM` may override this at runtime. */
export const DEFAULT_CONTACT_FROM_EMAIL = 'website@vitalityfamilychiropractic.com';

export const site = {
  name: 'Vitality Family Chiropractic',
  legalName: 'Vitality Family Chiropractic, LLC',
  tagline: 'Premier Prenatal, Pediatric, and Family Wellness Chiropractic Care',
  description:
    'Vitality Family Chiropractic offers prenatal, pediatric, and family wellness care in Celebration, Florida and College Station, Texas. Choose your office to see hours, team, and pricing.',
  url: 'https://www.vitalityfamilychiropractic.com',
  email: CONTACT_TO,
  /** Measurement id used on pages that are not inside one office. */
  analyticsId: 'G-D120PL4X89',
  logo: '/assets/img/logo.svg',
  /** Raster logo for JSON-LD; Google does not treat SVG as a logo image. */
  logoRaster: '/assets/img/logo-square.png',
  /** Default Open Graph image. */
  ogImage: '/assets/img/logo.png',
  social: {
    facebook: 'vitalityfamilychiropractic',
  },
  /**
   * Gather & Grow and Shop, linking to `/{office}/our-community/` and
   * `/{office}/shop/`. Set `inNav` to false to leave an item out of production
   * menus. The dev server and non-production Cloudflare Pages branches still
   * show it, in gray.
   */
  community: {
    inNav: false,
  },
  shop: {
    inNav: false,
  },
} as const;

/** From display name. Same text the old form sent as `from_name`. */
export const DEFAULT_CONTACT_FROM_NAME = `${site.name} website`;
