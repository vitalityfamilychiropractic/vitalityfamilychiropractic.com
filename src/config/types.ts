/**
 * Shape of the site's editable configuration.
 *
 * These types are what make adding a location safe: leave out a required field
 * in `locations.ts` and `bun run build` fails with the field name, rather than
 * quietly publishing a page with a blank phone number.
 */

/** A single day's opening hours. Multiple blocks = a midday break. */
export interface HoursEntry {
  /** Full day name, e.g. 'Monday'. Order in the array is display order. */
  day: string;
  /**
   * Human-readable time ranges, e.g. ['8:30am - 1pm', '1:45pm - 4pm'].
   * Use an empty array for a closed day and set `note` instead.
   */
  blocks: string[];
  /** Shown in place of times, e.g. 'By Appointment' or 'Closed'. */
  note?: string;
  /**
   * Machine-readable ranges for schema.org, as ['HH:MM', 'HH:MM'] pairs in
   * 24-hour time. Omit for closed / by-appointment days so they are simply
   * absent from the structured data.
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

/** Overrides for one specialty page's contact card at one office. */
export interface SpecialtyLead {
  /** Team member slug. Omit to keep the office's usual lead. */
  member?: string;
  /**
   * Heading on the card. Omit to derive it from the member's `role`.
   */
  label?: string;
}

export interface LocationImages {
  /** Wide photo behind the home-page welcome banner. */
  banner: string;
  /** Wide photo behind the "Why choose me?" panel at large breakpoints. */
  whyMe: string;
  /** Photo behind this office on the location chooser. */
  landing: string;
  /** Portrait used as the LocalBusiness image in JSON-LD. */
  portraitStudio: string;
  portraitStudioAlt: string;
  values: string;
  valuesAlt: string;
  /** Home-page feature card photo, keyed by specialty slug. */
  specialties: Record<string, string>;
  specialtiesAlt: Record<string, string>;
  /** Large photo at the top of the specialty page, keyed by specialty slug. */
  specialtyPages: Record<string, string>;
  specialtyPagesAlt: Record<string, string>;
}

export interface Location {
  /** URL segment and config key, e.g. 'celebration'. Lowercase, hyphenated. */
  slug: string;
  /** Short label used in nav, page titles and the location switcher. */
  name: string;
  address: PostalAddress;
  /** Formatted for display, e.g. '(407) 584-7900'. */
  phone: string;
  email: string;
  /** Social handles (page names, not full URLs). */
  social: { facebook: string };
  /** Google Analytics measurement id for this office. */
  analyticsId: string;
  /** Google Maps place link, opened from the address. */
  mapUrl: string;
  /** Google Maps embed URL for the iframe in the footer. */
  mapEmbedUrl: string;
  /** Latitude/longitude for LocalBusiness structured data. */
  geo: { lat: number; lng: number };
  /** This office's own Jane App booking site. */
  bookingUrl: string;
  /**
   * Where the contact form posts. Each office can have its own endpoint so
   * enquiries land in the right inbox.
   */
  form: { endpoint: string };
  hours: HoursEntry[];
  /**
   * Slugs of the specialty pages this office offers, in display order. Each
   * must match a file in `src/content/specialties/`.
   */
  specialties: string[];
  /**
   * Who a given specialty page's contact card should name at this office.
   * Anything not listed falls back to `lead`. The current pages do not render
   * that card; the field is here so a later service can name someone else
   * without a template change.
   */
  specialtyLeads?: Partial<Record<string, SpecialtyLead>>;
  /** Team member slugs on this office's team page, in display order. */
  team: string[];
  /**
   * The team member whose portrait, signature and voice lead this office's
   * pages.
   */
  lead: string;
  /**
   * Towns and counties this office serves, used in LocalBusiness structured
   * data.
   */
  areaServed: string[];
  /** Intro copy above the pricing tabs. */
  pricingIntro: string;
  /** 'p' or 'h3' — each office's pricing page introduces itself differently. */
  pricingIntroLevel: 'p' | 'h3';
  /** Insurance paragraph. Omitted when the intro already covers it. */
  insuranceNote?: string;
  /** Green notice above the tabs. */
  pricingNotice: string;
  /** Heading above `fees`, e.g. 'Out of pocket pricing:'. */
  feesHeading?: string;
  fees: FeeLine[];
  pricing: Pricing;
  images: LocationImages;
  /** Optional alert across the top of this office's home page. */
  announcement?: string;
  /** Elfsight Google Reviews widget id, when this office shows reviews. */
  reviewsWidgetId?: string;
}

export interface PracticeMix {
  label: string;
  /** Percentage of practice, 0–100. */
  percent: number;
}

/**
 * What everyone in `team.ts` has, whatever their job.
 *
 * A team member is a discriminated union on `schemaType`. Clinical fields are
 * required of a `Physician`, because they get a full profile page, and
 * optional for a `Person`.
 */
interface TeamMemberBase {
  slug: string;
  /** Full name without credentials, e.g. 'Christie McLarty'. */
  name: string;
  /** Informal name used in body copy, e.g. 'Dr. Christie'. */
  shortName: string;
  /** Name shown in the home banner when this person leads an office, e.g. 'Dr Christie'. */
  welcomeName: string;
  /**
   * Job title in singular, capitalised: 'Chiropractor'.
   * Drives the default heading on a specialty contact card.
   */
  role: string;
  /**
   * ISO date (`YYYY-MM-DD`) they began practising. Years in practice are
   * derived from this at build time and refreshed in the browser on load.
   */
  practiceStartDate: string;
  email: string;
  /** Facebook page name, not a full URL. */
  facebook?: string;
  signature?: string;
  signatureAlt?: string;
  /**
   * Extra "Why choose me?" bullets for one office, keyed by location slug.
   * Shown above `highlights`, and only at that office. May contain inline HTML.
   */
  locationHighlights?: Partial<Record<string, string[]>>;
  /** "Why choose me?" experience bullets shown at every office. May contain inline HTML for a link. */
  highlights?: string[];
  /** "Why choose me?" passion bullets. */
  passions?: string[];
  /**
   * Meta description for this person's profile at every office. May use
   * content tokens: `{{lead}}` is this person, and the office name, place,
   * and phone come from the office page being rendered.
   */
  summary?: string;
}

interface Clinician extends TeamMemberBase {
  schemaType: 'Physician';
  /** Post-nominals, e.g. 'DC'. */
  credentials: string;
  certifications: string;
  specialty: string;
  photo: string;
  /** Body paragraphs, in order. */
  bio: string[];
  practiceMix: PracticeMix[];
  /** "What's important to me" list. */
  priorities: string[];
  /** "In the office and in the community" paragraphs. */
  community: string[];
}

interface Associate extends TeamMemberBase {
  schemaType: 'Person';
  credentials?: string;
  certifications?: string;
  specialty?: string;
  photo?: string;
  bio?: string[];
  practiceMix?: PracticeMix[];
  priorities?: string[];
  community?: string[];
}

export type TeamMember = Clinician | Associate;
