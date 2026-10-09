import { site } from './site';
import { team } from './team';
import type { Location } from './types';

/**
 * Everything that differs between offices lives here. Shared prose — the
 * specialty pages, the values, the privacy policy — is written once in
 * `src/content/` and rendered for every location.
 *
 * To open a new office, copy an entry, change its `slug`, and add any new
 * person to `team.ts`. No template or route file needs to change.
 *
 * Array order is display order.
 */

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
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=605+Celebration+Avenue+Celebration+FL+34747',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3512.3003327520937!2d-81.54208688736924!3d28.31951147573632!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88dd7fcbf0716f75%3A0x41cc63344526be49!2sVitality%20Family%20Chiropractic!5e0!3m2!1sen!2sus!4v1751985277050!5m2!1sen!2sus',
    geo: { lat: 28.31951619812341, lng: -81.54208688774355 },
    bookingUrl: 'https://vfccelebration.janeapp.com/',
    form: { endpoint: 'https://formspree.io/f/xwpknnaj' },
    announcement: 'Now Accepting New Patient Appointments',
    reviewsWidgetId: 'eefed204-8a10-4037-891d-27e15a8fec59',
    hours: [
      { day: 'Monday', blocks: ['8:30am - 4pm'], machine: [['08:30', '16:00']] },
      { day: 'Tuesday', blocks: ['8:30am - 4pm'], machine: [['08:30', '16:00']] },
      { day: 'Wednesday', blocks: ['8:30am - 6pm'], machine: [['08:30', '18:00']] },
      { day: 'Thursday', blocks: ['8:30am - 1pm'], machine: [['08:30', '13:00']] },
      { day: 'Friday', blocks: [], note: 'By Appointment' },
      { day: 'Saturday', blocks: [], note: 'Closed' },
      { day: 'Sunday', blocks: [], note: 'Closed' },
    ],
    specialties: ['pregnancy-care', 'pediatric-care', 'family-wellness-care'],
    team: ['christie-mclarty'],
    lead: 'christie-mclarty',
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
      'Our goal is to provide affordable family chiropractic care with up front pricing so you are never waiting on a mystery medical bill from us.  We are out of network with all insurance plans, but will gladly provide you with documentation to submit for reimbursement to your insurance.  We accept HSA cards and health sharing plans.',
    pricingIntroLevel: 'p',
    pricingNotice: 'New Patient Consultation, Exam, and First Adjustment: $150',
    fees: [],
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
    images: {
      banner: '/assets/img/banner-christie-gray.jpg',
      whyMe: '/assets/img/why-me-christie-gray.png',
      portraitStudio: '/assets/img/team/christie-mclarty.jpg',
      portraitStudioAlt: 'Portrait of Christie McLarty, DC',
      values: '/assets/img/our-values.jpg',
      valuesAlt: 'A chiropractor treating a patient laying on a chiropractic table.',
      specialties: {
        'pregnancy-care': '/assets/img/pregnancy-care-christie.jpg',
        'pediatric-care': '/assets/img/pediatric-care-christie.jpg',
        'family-wellness-care': '/assets/img/family-wellness-care-christie.jpg',
      },
      specialtiesAlt: {
        'pregnancy-care': 'Prenatal chiropractic care in Celebration',
        'pediatric-care': 'Pediatric chiropractic care in Celebration',
        'family-wellness-care': 'Family wellness chiropractic care in Celebration',
      },
      specialtyPages: {
        'pregnancy-care': '/assets/img/pregnancy-care-page-christie.jpg',
        'pediatric-care': '/assets/img/pediatric-care-page-christie.jpg',
        'family-wellness-care': '/assets/img/family-wellness-care-page-christie.jpg',
      },
      specialtyPagesAlt: {
        'pregnancy-care': 'Dr. Christie adjusting a pregnant patient in the Celebration office.',
        'pediatric-care': 'A sleeping newborn being gently checked in the Celebration office.',
        'family-wellness-care': 'Dr. Christie with children in the Celebration treatment room.',
      },
    },
  },
  {
    slug: 'college-station',
    name: 'College Station',
    address: {
      street: '3012 Barron Road Suite 300',
      city: 'College Station',
      state: 'Texas',
      stateAbbr: 'TX',
      zip: '77845',
    },
    phone: '(979) 703-7977',
    email: 'info@vitalityfamilychiropractic.com',
    social: { facebook: 'vitalityfamilychiropractic' },
    analyticsId: 'G-P4WYJN76TD',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=3012+Barron+Road+Suite+300+College+Station+TX+77845',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3435.7672416409823!2d-96.29873168731905!3d30.555879574564223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864684c10ec2e337%3A0xbceeff1fdc978b2!2sVitality%20Family%20Chiropractic!5e0!3m2!1sen!2sus!4v1751984983196!5m2!1sen!2sus',
    geo: { lat: 30.55582, lng: -96.29614 },
    bookingUrl: 'https://vfc.janeapp.com/',
    form: { endpoint: 'https://formspree.io/f/xwpknnaj' },
    reviewsWidgetId: '53d76228-c4d3-4c40-bc7f-bc659aa7e9c6',
    hours: [
      {
        day: 'Monday',
        blocks: ['8:30am - 1pm', '1:45pm - 4pm'],
        machine: [
          ['08:30', '13:00'],
          ['13:45', '16:00'],
        ],
      },
      {
        day: 'Tuesday',
        blocks: ['8:30am - 1pm', '1:45pm - 4pm'],
        machine: [
          ['08:30', '13:00'],
          ['13:45', '16:00'],
        ],
      },
      {
        day: 'Wednesday',
        blocks: ['8:30am - 1pm', '2:30pm - 6pm'],
        machine: [
          ['08:30', '13:00'],
          ['14:30', '18:00'],
        ],
      },
      { day: 'Thursday', blocks: ['8:30am - 1pm'], machine: [['08:30', '13:00']] },
      { day: 'Friday', blocks: [], note: 'By Appointment' },
      { day: 'Saturday', blocks: [], note: 'Closed' },
      { day: 'Sunday', blocks: [], note: 'Closed' },
    ],
    specialties: ['pregnancy-care', 'pediatric-care', 'family-wellness-care'],
    team: ['christie-mclarty'],
    lead: 'christie-mclarty',
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
    pricingIntroLevel: 'h3',
    insuranceNote:
      'We are in-network with Blue Cross Blue Shield PPO and Health Select plans.  Specific information regarding your insurance coverage will be reviewed during your new patient appointment.  Insurance does not cover chiropractic care for children under 5 years of age or maintenance/wellness care.',
    pricingNotice: 'Pricing Effective September 1, 2026',
    feesHeading: 'Out of pocket pricing:',
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
    images: {
      banner: '/assets/img/banner-christie-gray.jpg',
      whyMe: '/assets/img/why-me-christie-gray.png',
      portraitStudio: '/assets/img/team/christie-mclarty.jpg',
      portraitStudioAlt: 'Portrait of Christie McLarty, DC',
      values: '/assets/img/our-values.jpg',
      valuesAlt: 'A chiropractor treating a patient laying on a chiropractic table.',
      specialties: {
        'pregnancy-care': '/assets/img/pregnancy-care-christie.jpg',
        'pediatric-care': '/assets/img/pediatric-care-christie.jpg',
        'family-wellness-care': '/assets/img/family-wellness-care-christie.jpg',
      },
      specialtiesAlt: {
        'pregnancy-care': 'Prenatal chiropractic care in College Station',
        'pediatric-care': 'Pediatric chiropractic care in College Station',
        'family-wellness-care': 'Family wellness chiropractic care in College Station',
      },
      specialtyPages: {
        'pregnancy-care': '/assets/img/pregnancy-care-page-christie.jpg',
        'pediatric-care': '/assets/img/pediatric-care-page-christie.jpg',
        'family-wellness-care': '/assets/img/family-wellness-care-page-christie.jpg',
      },
      specialtyPagesAlt: {
        'pregnancy-care': 'Dr. Christie with a pregnant patient in the College Station office.',
        'pediatric-care': 'Dr. Christie with young children in the College Station office.',
        'family-wellness-care': 'Dr. Christie with a family in the College Station office.',
      },
    },
  },
];

const locationSlugs = new Set(locations.map((location) => location.slug));
for (const member of team) {
  for (const slug of Object.keys(member.locationHighlights ?? {})) {
    if (!locationSlugs.has(slug)) {
      throw new Error(
        `${member.slug} locationHighlights key "${slug}" is not an office. Known offices: ${[...locationSlugs].join(', ')}.`,
      );
    }
  }
}

for (const location of locations) {
  for (const row of location.pricing.rows) {
    if (row.values.length !== location.pricing.tiers.length) {
      throw new Error(
        `${location.slug} pricing row "${row.label}" has ${row.values.length} values but there are ${location.pricing.tiers.length} tiers.`,
      );
    }
  }
  for (const slug of location.specialties) {
    if (!location.images.specialties[slug] || !location.images.specialtyPages[slug]) {
      throw new Error(`${location.slug} is missing a photo for specialty "${slug}".`);
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

/** Full one-line address, e.g. '605 Celebration Avenue, Celebration, FL 34747'. */
export function formatAddress(location: Location): string {
  const { street, street2, city, stateAbbr, zip } = location.address;
  return [street, street2, `${city}, ${stateAbbr} ${zip}`].filter(Boolean).join(', ');
}

/** City and state line used under the street address, e.g. 'Celebration, FL 34747'. */
export function formatCityLine(location: Location): string {
  const { city, stateAbbr, zip } = location.address;
  return `${city}, ${stateAbbr} ${zip}`;
}

/** Digits-only phone for `tel:` links, e.g. '+14075847900'. */
export function telHref(phone: string): string {
  return `+1${phone.replace(/\D/g, '')}`;
}

/**
 * Full Facebook URL from a page handle. Accepts a location or the brand-level
 * `site` object — both store the handle under `social.facebook`.
 */
export function facebookHref(entity: { social?: { facebook?: string } }): string {
  const handle = entity.social?.facebook ?? site.social.facebook;
  return `https://www.facebook.com/${handle}`;
}

