import { site } from './site';
import type { Location } from './types';

/**
 * Everything that differs between offices lives here. Shared prose is written
 * once in `src/content/` and rendered for every location.
 *
 * To open a new office, copy an entry and change its `slug`. No template or
 * route file needs to change.
 *
 * Array order is display order.
 */

const collegeStationInsurance =
  '<strong>Insurance:</strong> We are in-network with Blue Cross Blue Shield PPO and BCBS HealthSelect plans. Specific information regarding your insurance coverage will be reviewed during your new patient appointment. Insurance does not cover chiropractic care for children under 5 years of age or maintenance/wellness care.';

const collegeStationInsuranceFaq = [
  '<p>Yes! Our College Station office is in network with BCBS PPO plans and BCBS HealthSelect plans.</p>',
  "<p>If we're not in network with your insurance, we're happy to provide a superbill that you can submit to your insurance company for possible out-of-network reimbursement.</p>",
  '<p>For children under age five, chiropractic care is treated as a non-covered service under BCBS at our office, and those visits are not submitted to insurance.</p>',
].join('');

const celebrationInsurance =
  '<p>We are out of network with all insurance plans, but will gladly provide you with documentation to submit for reimbursement to your insurance. We accept HSA cards and health sharing plans.</p>';

export const locations: Location[] = [
  {
    slug: 'celebration',
    name: 'Celebration',
    address: {
      street: '605 Celebration Avenue',
      city: 'Celebration',
      state: 'Florida',
      stateAbbr: 'FL',
      zip: '34747',
    },
    phone: '(407) 584-7900',
    email: 'info@vitalityfamilychiropractic.com',
    social: { facebook: 'vitalityfamilychiropractic' },
    analyticsId: 'G-D120PL4X89',
    eventsCalendarId: 'c_503e49f0dcd5538b5d17f5abc1602d7630ce99749b432f82b7d4f4402b82ad72@group.calendar.google.com',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=605+Celebration+Avenue+Celebration+FL+34747',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3512.3003327520937!2d-81.54208688736924!3d28.31951147573632!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88dd7fcbf0716f75%3A0x41cc63344526be49!2sVitality%20Family%20Chiropractic!5e0!3m2!1sen!2sus!4v1751985277050!5m2!1sen!2sus',
    geo: { lat: 28.31951619812341, lng: -81.54208688774355 },
    bookingUrl: 'https://vfccelebration.janeapp.com/',
    announcement: 'Now accepting new patient appointments',
    hours: [
      { day: 'Monday', blocks: ['8:30 AM–4:00 PM'], machine: [['08:30', '16:00']] },
      { day: 'Tuesday', blocks: ['8:30 AM–4:00 PM'], machine: [['08:30', '16:00']] },
      { day: 'Wednesday', blocks: ['8:30 AM–6:00 PM'], machine: [['08:30', '18:00']] },
      { day: 'Thursday', blocks: ['8:30 AM–1:00 PM'], machine: [['08:30', '13:00']] },
      { day: 'Friday', blocks: [], note: 'By appointment' },
      { day: 'Saturday', blocks: [], note: 'Closed' },
      { day: 'Sunday', blocks: [], note: 'Closed' },
    ],
    services: ['prenatal', 'newborn-infant', 'pediatric', 'adult-family'],
    team: ['christie'],
    lead: 'christie',
    areaServed: [
      'Celebration',
      'Davenport',
      'Lake Buena Vista',
      'Orlando',
      'Windermere',
      'Winter Garden',
      'Winter Park',
      'Orange County',
      'Osceola County',
      'Polk County',
    ],
    pricingIntro:
      'Our goal is to provide affordable family chiropractic care with up front pricing so you are never waiting on a mystery medical bill from us.',
    insuranceNote: celebrationInsurance,
    insuranceFaq: celebrationInsurance,
    feesHeading: 'Out of pocket pricing:',
    fees: [{ label: 'New Patient Consultation, Exam, and First Adjustment', amount: '$150' }],
    pricing: {
      tiers: [
        '1 Person',
        '1 Adult & 1-2 Kids',
        '1 Adult & 3+ Kids',
        '2 Adults',
        '2 Adults & Kids',
      ],
      rows: [
        { label: 'Per Visit', unit: '/visit', values: [70, 100, 125, 125, 150] },
        { label: 'Weekly Visits', unit: '/month', values: [180, 260, 325, 325, 390] },
        { label: 'Biweekly Visits', unit: '/month', values: [120, 165, 205, 205, 245] },
        {
          label: 'Weekly Prepaid Visits',
          unit: '/year',
          values: [1836, 2652, 3315, 3315, 3978],
        },
        {
          label: 'Biweekly Prepaid Visits',
          unit: '/year',
          values: [1173, 1683, 2091, 2091, 2499],
        },
      ],
    },
    photoAliases: {
      'landing-office': 'celebration-reception',
      'office-reception': 'celebration-reception',
      'office-waiting-room': 'celebration-waiting-room',
    },
    homeClaim:
      'Vitality Family Chiropractic offers prenatal and pediatric chiropractic care in Celebration. Dr. Christie founded the practice and spent more than a decade caring for families in College Station before opening this office.',
    homeBlurb: 'Now welcoming new patients.',
    shop: { label: 'Shop', href: null, inNav: false },
  },
  {
    slug: 'college-station',
    name: 'College Station',
    address: {
      street: '3012 Barron Road',
      street2: 'Suite 300',
      city: 'College Station',
      state: 'Texas',
      stateAbbr: 'TX',
      zip: '77845',
    },
    phone: '(979) 703-7977',
    email: 'info@vitalityfamilychiropractic.com',
    social: { facebook: 'vitalityfamilychiropractic' },
    analyticsId: 'G-P4WYJN76TD',
    eventsCalendarId: 'c_246191c42c744962d17ec248914f6ab930c66eb5d6acfa7b95c926e791f30045@group.calendar.google.com',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=3012+Barron+Road+Suite+300+College+Station+TX+77845',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3435.7672416409823!2d-96.29873168731905!3d30.555879574564223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864684c10ec2e337%3A0xbceeff1fdc978b2!2sVitality%20Family%20Chiropractic!5e0!3m2!1sen!2sus!4v1751984983196!5m2!1sen!2sus',
    geo: { lat: 30.55582, lng: -96.29614 },
    bookingUrl: 'https://vfc.janeapp.com/',
    hours: [
      { day: 'Monday', blocks: ['8:30 AM–4:00 PM'], machine: [['08:30', '16:00']] },
      { day: 'Tuesday', blocks: ['8:30 AM–4:00 PM'], machine: [['08:30', '16:00']] },
      { day: 'Wednesday', blocks: ['8:30 AM–6:00 PM'], machine: [['08:30', '18:00']] },
      { day: 'Thursday', blocks: ['8:30 AM–1:00 PM'], machine: [['08:30', '13:00']] },
      { day: 'Friday', blocks: [], note: 'Closed' },
      { day: 'Saturday', blocks: ['8:30 AM–12:30 PM'], note: 'one Saturday per month' },
      { day: 'Sunday', blocks: [], note: 'Closed' },
    ],
    services: ['prenatal', 'newborn-infant', 'pediatric', 'adult-family', 'massage-therapy'],
    team: ['mikah', 'christie', 'yvonne', 'mikayla', 'candice'],
    lead: 'christie',
    areaServed: [
      'College Station',
      'Bryan',
      'Anderson',
      'Brenham',
      'Caldwell',
      'Franklin',
      'Lexington',
      'Navasota',
      'Brazos County',
      'Burleson County',
      'Grimes County',
      'Robertson County',
      'Brazos Valley',
    ],
    pricingIntro:
      'We strive to make our pricing affordable for families to receive regular chiropractic care',
    insuranceNote: collegeStationInsurance,
    insuranceFaq: collegeStationInsuranceFaq,
    pricingEffective: 'Pricing Effective September 1, 2026',
    feesHeading: 'Out of pocket pricing:',
    feesNote: 'The child add-on price covers all of your children together, not each child.',
    fees: [
      { label: 'New Patient Consultation and Adjustment', amount: '$170' },
      {
        label: 'Add-on adjustment for children with parent using insurance',
        amount: '$40 (1-2 kids) and $60 (3+ kids)',
      },
    ],
    pricing: {
      tiers: [
        '1 Person',
        '1 Adult & 1-2 Kids',
        '1 Adult & 3+ Kids',
        '2 Adults',
        '2 Adults & Kids',
      ],
      rows: [
        { label: 'Per Visit', unit: '/visit', values: [70, 100, 125, 125, 150] },
        { label: 'Weekly Visits', unit: '/month', values: [180, 260, 325, 325, 390] },
        { label: 'Biweekly Visits', unit: '/month', values: [120, 165, 205, 205, 240] },
        {
          label: 'Weekly Prepaid Visits',
          unit: '/year',
          values: [1836, 2652, 3315, 3315, 3978],
        },
        {
          label: 'Biweekly Prepaid Visits',
          unit: '/year',
          values: [1173, 1683, 2091, 1999, 2299],
        },
      ],
    },
    photoAliases: {
      'landing-office': 'college-station-reception',
      'office-reception': 'college-station-reception',
      'office-waiting-room': 'college-station-waiting-room',
    },
    homeClaim:
      'Vitality Family Chiropractic is <strong>the leader in prenatal and pediatric chiropractic care in the Brazos Valley</strong>, and we\'ve been caring for families here for over 13 years.',
    homeBlurb: 'Caring for Brazos Valley families for over 13 years.',
    shop: { label: 'Shop', href: null, inNav: true },
  },
];

for (const location of locations) {
  for (const row of location.pricing.rows) {
    if (row.values.length !== location.pricing.tiers.length) {
      throw new Error(
        `${location.slug} pricing row "${row.label}" has ${row.values.length} values but there are ${location.pricing.tiers.length} tiers.`,
      );
    }
  }
}

const locationsBySlug = new Map(locations.map((l) => [l.slug, l]));

/** Look up a location, failing the build loudly on an unknown slug. */
export function getLocation(slug: string): Location {
  const location = locationsBySlug.get(slug);
  if (!location) {
    throw new Error(
      `Unknown location slug "${slug}". Locations are defined in src/config/locations.ts.`,
    );
  }
  return location;
}

/** Street line, e.g. '3012 Barron Road, Suite 300'. */
export function formatStreet(location: Location): string {
  return [location.address.street, location.address.street2].filter(Boolean).join(', ');
}

/** City and state line. The ZIP stays off the visible address. */
export function formatCityLine(location: Location): string {
  const { city, stateAbbr } = location.address;
  return `${city}, ${stateAbbr}`;
}

/** City, state and zip line. */
export function formatCityZipLine(location: Location): string {
  const { city, stateAbbr, zip } = location.address;
  return `${city}, ${stateAbbr} ${zip}`;
}

/** Full one-line address. */
export function formatAddress(location: Location): string {
  return [formatStreet(location), formatCityLine(location)].filter(Boolean).join(', ');
}

/** Digits-only phone for `tel:` links, e.g. '+14075847900'. */
export function telHref(phone: string): string {
  return `+1${phone.replace(/\D/g, '')}`;
}

/**
 * Display form of {@link telHref}. Spaces separate the country code, area
 * code, and prefix, e.g. '+1 979 703 7977'.
 */
export function telHrefFormatted(phone: string): string {
  const match = telHref(phone).match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (!match) {
    throw new Error(`Cannot format telephone number "${phone}".`);
  }
  return `+1 ${match[1]} ${match[2]} ${match[3]}`;
}

/**
 * Full Facebook URL from a page handle. Accepts a location or the brand-level
 * `site` object — both store the handle under `social.facebook`.
 */
export function facebookHref(entity: { social?: { facebook?: string } }): string {
  const handle = entity.social?.facebook ?? site.social.facebook;
  return `https://www.facebook.com/${handle}`;
}
