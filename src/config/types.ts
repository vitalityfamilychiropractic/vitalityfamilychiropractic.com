/**
 * Shape of the site's editable configuration.
 *
 * Leave out a required field in `locations.ts` and `bun run build` fails with
 * the field name, rather than publishing a page with a blank phone number.
 */

/** A single day's opening hours. Multiple blocks = a midday break. */
export interface HoursEntry {
  /** Full day name, e.g. 'Monday'. Order in the array is display order. */
  day: string;
  /**
   * Human-readable time ranges, e.g. ['8:30 AM–4:00 PM'].
   * Use an empty array for a closed day and set `note` instead.
   */
  blocks: string[];
  /** Shown in place of times, or after the times when both are set. */
  note?: string;
  /**
   * Machine-readable ranges for schema.org, as ['HH:MM', 'HH:MM'] pairs in
   * 24-hour time. Omit for closed, by-appointment, and display-only days so
   * they stay out of the structured data.
   */
  machine?: Array<[string, string]>;
}

export interface PostalAddress {
  street: string;
  /** Second address line, e.g. a suite. Optional. */
  street2?: string;
  city: string;
  /** Full state name, e.g. 'Florida'. */
  state: string;
  /** Two-letter postal abbreviation, e.g. 'FL'. */
  stateAbbr: string;
  zip: string;
}

/** One column of the pricing tabs. `values` lines up with `Pricing.tiers`. */
export interface PricingRow {
  label: string;
  /** Suffix appended to each price, e.g. '/visit', '/month'. */
  unit: string;
  values: number[];
}

export interface Pricing {
  /** Tab headings — the family configurations offered. */
  tiers: string[];
  rows: PricingRow[];
}

/** A one-off fee listed above the grid. */
export interface FeeLine {
  label: string;
  /** Free text so ranged fees ('$40 (1-2 kids) and $60 (3+ kids)') fit too. */
  amount: string;
}

/** A nav item that is present even when it does not link anywhere yet. */
export interface ShopLink {
  label: string;
  /** Null keeps the label in the menu without making it a link. */
  href: string | null;
  inNav: boolean;
}

export interface Location {
  /** URL segment and config key, e.g. 'celebration'. Lowercase, hyphenated. */
  slug: string;
  /** Short label used in nav, page titles and the location switcher. */
  name: string;
  address: PostalAddress;
  /**
   * When true, the visible address and schema.org PostalAddress omit the ZIP.
   * The map query can still include it.
   */
  hidePostalCode?: boolean;
  /** Formatted for display, e.g. '(407) 584-7900'. */
  phone: string;
  email: string;
  /** Social handles (page names, not full URLs). */
  social: { facebook: string };
  /** Google Analytics measurement id for this office. */
  analyticsId: string;
  /** Google Maps place link, opened from the address. */
  mapUrl: string;
  /** Google Maps embed URL for the contact-page iframe. */
  mapEmbedUrl: string;
  /** Latitude/longitude for LocalBusiness structured data. */
  geo: { lat: number; lng: number };
  /** This office's own Jane App booking site. */
  bookingUrl: string;
  hours: HoursEntry[];
  /**
   * Service slugs this office offers, in display order. Each must match a file
   * in `src/content/services/`. Massage is included only where it is offered.
   */
  services: string[];
  /**
   * Team member slugs on this office's team page, in display order.
   * This array is the only order. A person who works at more than one
   * office is listed in each office's array where that office wants them.
   */
  team: string[];
  /** The team member whose name fills `{{lead}}` in shared prose. */
  lead: string;
  /**
   * Towns and counties this office serves, used in LocalBusiness structured
   * data.
   */
  areaServed: string[];
  /** Intro copy under the pricing page title. */
  pricingIntro: string;
  /** Insurance paragraph on the pricing page. May contain inline HTML. */
  insuranceNote?: string;
  /** Badge above the fee list, e.g. 'Pricing Effective September 1, 2026'. */
  pricingEffective?: string;
  /** Heading above `fees`, e.g. 'Out of pocket pricing:'. */
  feesHeading?: string;
  /** Note under the fee rows, e.g. the child add-on clarification. */
  feesNote?: string;
  fees: FeeLine[];
  pricing: Pricing;
  /**
   * Photo id replacements for this office. When a page asks for a College
   * Station interior or staff-group photo, the substitute is used instead,
   * including that photo's own default crop.
   */
  photoAliases?: Record<string, string>;
  /** First paragraph of the home "family" section. May contain inline HTML. */
  homeClaim: string;
  /** Sentence appended to the home meta description. */
  homeBlurb: string;
  /**
   * Answer to "Do you take insurance?" on the first-visit page.
   * HTML, one or more `<p>` elements, so it is not wrapped again.
   */
  insuranceFaq: string;
  /** Optional sentence above `<main>` on this office's pages. */
  announcement?: string;
  /** Shop menu item. Omitted from the nav when `inNav` is false. */
  shop?: ShopLink;
}

/** Fields schema.org needs from a team member. Bios live in the content collection. */
export interface StaffSummary {
  slug: string;
  name: string;
  role: string;
  schemaType: 'Physician' | 'Person';
  credentials?: string;
  email?: string;
}
