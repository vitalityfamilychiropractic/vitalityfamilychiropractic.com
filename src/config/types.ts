/**
 * Shape of the site's editable configuration.
 *
 * These types are what make adding a location safe: leave out a required field
 * in `locations.ts` and `bun run build` fails with the field name, rather than
 * quietly publishing a page with a blank phone number.
 */

/** A single day's opening hours. Multiple blocks = a midday break. */
export interface HoursEntry {
  /** Three-letter day label, e.g. 'Mon'. Order in the array is display order. */
  day: string;
  /**
   * Human-readable time ranges, e.g. ['8:30am – 1pm', '1:45pm – 4pm'].
   * Use an empty array for a closed day and set `note` instead.
   */
  blocks: string[];
  /** Shown in place of times, e.g. 'By appointment' or 'Closed'. */
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

/** One row of the pricing grid. `values` must line up with `Pricing.tiers`. */
export interface PricingRow {
  label: string;
  /** Suffix appended to each price, e.g. '/visit', '/month'. */
  unit: string;
  values: number[];
}

export interface Pricing {
  /** Column headings — the family configurations offered. */
  tiers: string[];
  rows: PricingRow[];
}

/** Overrides for one specialty page's contact card at one office. */
export interface SpecialtyLead {
  /** Team member slug. Omit to keep the office's usual lead. */
  member?: string;
  /**
   * Heading on the card. Omit to derive it from the member's `role`, e.g.
   * "Your massage therapist".
   */
  label?: string;
}

/** A one-off fee listed above the grid. */
export interface FeeLine {
  label: string;
  /** Free text so ranged fees ('$30 (1–2 kids) and $45 (3+ kids)') fit too. */
  amount: string;
}

export interface LocationImages {
  /** Transparent-background portrait of the lead, for the hero panel. */
  portraitCutout: string;
  /**
   * Alt text describing what is actually in `portraitCutout`. Required rather
   * than generated, because these photos differ — one office's is the lead
   * with a baby, another's is the lead with two toddlers.
   */
  portraitCutoutAlt: string;
  /** Studio portrait of the lead, for the "why choose" card. */
  portraitStudio: string;
  /** Alt text describing what is actually in `portraitStudio`. */
  portraitStudioAlt: string;
  /**
   * Keyed by specialty slug — the photo shown on that specialty's page and
   * card. Partial on purpose: a specialty with no photo yet renders a tinted
   * panel instead of a broken image, so a new service can go live before the
   * photography does.
   */
  specialties: Partial<Record<string, string>>;
  /** Alt text per specialty slug. Keys must match `specialties`. */
  specialtiesAlt?: Partial<Record<string, string>>;
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
  /** Google Maps place link, opened from the address. */
  mapUrl: string;
  /** Google Maps embed URL for the iframe on the contact page. */
  mapEmbedUrl: string;
  /** Latitude/longitude for LocalBusiness structured data. */
  geo: { lat: number; lng: number };
  /** This office's own Jane App booking site. */
  bookingUrl: string;
  /**
   * Where the contact form posts. Each office gets its own access key so
   * enquiries land in the right inbox. See README for setup.
   */
  form: { endpoint: string; accessKey: string };
  hours: HoursEntry[];
  /**
   * Slugs of the specialty pages this office offers, in display order. Each
   * must match a file in `src/content/specialties/`.
   *
   * Offices do not have to offer the same set — one may add massage therapy
   * while another does not — and the nav, cards, routes and sitemap all follow
   * from this list.
   */
  specialties: string[];
  /**
   * Who a given specialty page's contact card should name at this office, and
   * what to call them. Keyed by specialty slug; anything not listed falls back
   * to `lead`.
   *
   * This is what lets College Station's massage therapy page read "Your
   * massage therapist" and name the therapist, while its pregnancy page still
   * names the office's lead chiropractor.
   */
  specialtyLeads?: Partial<Record<string, SpecialtyLead>>;
  /** Team member slugs on this office's team page, in display order. */
  team: string[];
  /**
   * The team member whose portrait, signature and voice lead this office's
   * pages, and the default name on every specialty card.
   */
  lead: string;
  /** Opening paragraph on the office home page. */
  intro: string;
  /** "Experience" bullets — credentials that set this office apart. */
  highlights: string[];
  /** "Passions" list — what this office cares about. */
  passions: string[];
  /** Intro paragraph above the pricing grid. */
  pricingIntro: string;
  /** Insurance situation — differs meaningfully between offices. */
  insuranceNote: string;
  /** Fees listed above the grid (new patient exam, add-ons). */
  fees: FeeLine[];
  pricing: Pricing;
  images: LocationImages;
  /** Optional banner across the top of every page for this office. */
  announcement?: string;
  /** Year this office opened — used in the location chooser. */
  openedYear?: number;
}

export interface PracticeMix {
  label: string;
  /** Percentage of practice, 0–100. */
  percent: number;
}

/**
 * Anyone who appears on a team page — chiropractors today, but massage
 * therapists, assistants and front-desk staff fit the same shape.
 */
export interface TeamMember {
  slug: string;
  /** Full name without credentials, e.g. 'Christie McLarty'. */
  name: string;
  /** Post-nominals, e.g. 'DC'. Empty string when there are none. */
  credentials: string;
  /** Informal name used in body copy, e.g. 'Dr. Christie'. */
  shortName: string;
  /**
   * Job title in singular, capitalised: 'Chiropractor', 'Massage Therapist'.
   * Drives the default heading on a specialty page's contact card — "Your
   * chiropractor", "Your massage therapist" — so a new kind of practitioner
   * labels itself.
   */
  role: string;
  /**
   * How search engines should read this person. Only use `Physician` for
   * licensed clinicians; everyone else is a `Person`.
   */
  schemaType: 'Physician' | 'Person';
  certifications: string;
  specialty: string;
  /**
   * ISO date (`YYYY-MM-DD`) they began practising. Years in practice are
   * derived from this at build time and refreshed in the browser on load, so
   * the figure never needs editing and never goes stale.
   */
  practiceStartDate: string;
  email: string;
  photo: string;
  /** Handwritten signature image, shown under the hero greeting. */
  signature: string;
  /** Alt text for the signature image. */
  signatureAlt: string;
  /** Body paragraphs, in order. */
  bio: string[];
  practiceMix: PracticeMix[];
  /** "What's important to me" list. */
  priorities: string[];
  /** "In the office and in the community" paragraphs. */
  community: string[];
}

export interface Specialty {
  slug: string;
  /** Page title, e.g. 'Pregnancy Care'. */
  title: string;
  /** One-line summary used on cards and in meta descriptions. */
  summary: string;
  /** Short label for the home page card. */
  cardLabel: string;
}
