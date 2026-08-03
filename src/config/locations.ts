import type { Location } from './types';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE FILE YOU EDIT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Everything that differs between offices lives here. Shared prose — the
 * specialty pages, the values, the privacy policy — is written once in
 * `src/content/` and rendered for every location automatically.
 *
 * To open a new office:
 *   1. Copy one of the entries below and change its `slug`.
 *   2. Add `public/img/locations/<slug>/` with portrait-cutout.png,
 *      portrait-studio.jpg, pregnancy-care.jpg, pediatric-care.jpg and
 *      family-wellness-care.jpg.
 *   3. Add the person to `team.ts` if they are new.
 *   4. `npm run build`.
 *
 * No template or route file needs to change. See README.md for the full
 * checklist.
 *
 * Array order is display order in the nav switcher and on the home page.
 */
export const locations: Location[] = [
  /* ───────────────────────────── Celebration, FL ───────────────────────── */
  {
    slug: 'celebration',
    name: 'Celebration',
    openedYear: 2024,
    address: {
      street: '605 Celebration Avenue',
      city: 'Celebration',
      state: 'Florida',
      stateAbbr: 'FL',
      zip: '34747',
    },
    phone: '(407) 584-7900',
    email: 'info@vitalityfamilychiropractic.com',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=605+Celebration+Avenue+Celebration+FL+34747',
    mapEmbedUrl:
      'https://www.google.com/maps?q=605+Celebration+Avenue,+Celebration,+FL+34747&output=embed',
    geo: { lat: 28.3255, lng: -81.534 },
    bookingUrl: 'https://vfccelebration.janeapp.com/',
    form: {
      endpoint: 'https://formspree.io/f/xwpknnaj',
      // Replace with this office's own Web3Forms access key — see README.
      accessKey: 'celebration',
    },
    announcement: 'Now accepting new patient appointments.',
    hours: [
      { day: 'Mon', blocks: ['8:30am – 4pm'], machine: [['08:30', '16:00']] },
      { day: 'Tue', blocks: ['8:30am – 4pm'], machine: [['08:30', '16:00']] },
      { day: 'Wed', blocks: ['8:30am – 6pm'], machine: [['08:30', '18:00']] },
      { day: 'Thu', blocks: ['8:30am – 1pm'], machine: [['08:30', '13:00']] },
      { day: 'Fri', blocks: [], note: 'By appointment' },
      { day: 'Sat', blocks: [], note: 'Closed' },
      { day: 'Sun', blocks: [], note: 'Closed' },
    ],
    specialties: ['pregnancy-care', 'pediatric-care', 'family-wellness-care'],
    team: ['christie-mclarty'],
    lead: 'christie-mclarty',
    intro:
      'Vitality Family Chiropractic is a community based wellness center in Celebration, Florida focused on helping families achieve a better quality of life through premier chiropractic care.',
    pricingIntro:
      'Our goal is to provide affordable family chiropractic care with up front pricing so you are never waiting on a mystery medical bill from us.',
    insuranceNote:
      'We are out of network with all insurance plans, but will gladly provide you with documentation to submit for reimbursement to your insurance. We accept HSA cards and health sharing plans.',
    fees: [
      {
        label: 'New Patient Consultation, Exam, and First Adjustment',
        amount: '$150',
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
        { label: 'Biweekly Visits', unit: '/month', values: [120, 165, 205, 205, 245] },
        { label: 'Weekly Prepaid Visits', unit: '/year', values: [1836, 2652, 3315, 3315, 3978] },
        { label: 'Biweekly Prepaid Visits', unit: '/year', values: [1173, 1683, 2091, 2091, 2499] },
      ],
    },
    images: {
      portraitCutout: '/img/locations/celebration/portrait-cutout.png',
      portraitCutoutAlt:
        'Dr. Christie kneeling and holding a laughing baby in a backwards cap',
      portraitStudio: '/img/locations/celebration/portrait-studio.jpg',
      portraitStudioAlt:
        'Dr. Christie seated, holding a baby in a blue plaid shirt on her lap',
      specialties: {
        'pregnancy-care': '/img/locations/celebration/pregnancy-care.jpg',
        'pediatric-care': '/img/locations/celebration/pediatric-care.jpg',
        'family-wellness-care': '/img/locations/celebration/family-wellness-care.jpg',
      },
      specialtiesAlt: {
        'pregnancy-care':
          'Dr. Christie adjusting the neck of a pregnant patient lying on an adjusting table',
        'pediatric-care':
          'A sleeping newborn on a blue blanket while a chiropractor gently cradles their head',
        'family-wellness-care':
          'Dr. Christie in the treatment room surrounded by four smiling children of different ages',
      },
    },
  },

  /* ──────────────────────────── College Station, TX ────────────────────── */
  {
    slug: 'college-station',
    name: 'College Station',
    openedYear: 2011,
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
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=3012+Barron+Road+Suite+300+College+Station+TX+77845',
    mapEmbedUrl:
      'https://www.google.com/maps?q=3012+Barron+Road+Suite+300,+College+Station,+TX+77845&output=embed',
    geo: { lat: 30.5637, lng: -96.2895 },
    bookingUrl: 'https://vfc.janeapp.com/',
    form: {
      endpoint: 'https://formspree.io/f/xwpknnaj',
      // Replace with this office's own Web3Forms access key — see README.
      accessKey: 'college-station',
    },
    hours: [
      {
        day: 'Mon',
        blocks: ['8:30am – 1pm', '1:45pm – 4pm'],
        machine: [
          ['08:30', '13:00'],
          ['13:45', '16:00'],
        ],
      },
      {
        day: 'Tue',
        blocks: ['8:30am – 1pm', '1:45pm – 4pm'],
        machine: [
          ['08:30', '13:00'],
          ['13:45', '16:00'],
        ],
      },
      {
        day: 'Wed',
        blocks: ['8:30am – 1pm', '2:30pm – 6pm'],
        machine: [
          ['08:30', '13:00'],
          ['14:30', '18:00'],
        ],
      },
      { day: 'Thu', blocks: ['8:30am – 1pm'], machine: [['08:30', '13:00']] },
      { day: 'Fri', blocks: [], note: 'By appointment' },
      { day: 'Sat', blocks: [], note: 'Closed' },
      { day: 'Sun', blocks: [], note: 'Closed' },
    ],
    // This office also offers massage therapy; Celebration does not.
    specialties: [
      'pregnancy-care',
      'pediatric-care',
      'family-wellness-care',
      'massage-therapy',
    ],
    // Massage therapy is delivered by someone other than the office's lead
    // chiropractor, so its page names them instead.
    specialtyLeads: {
      'massage-therapy': {
        member: 'candice-ashburn',
      },
    },
    team: ['ashley-harmon', 'christie-mclarty'],
    lead: 'ashley-harmon',
    intro:
      'Vitality Family Chiropractic is a community based wellness center in College Station, Texas focused on helping families achieve a better quality of life through premier chiropractic care.',
    pricingIntro:
      'We strive to make our pricing affordable for families to receive regular chiropractic care.',
    insuranceNote:
      'We are in-network with Blue Cross Blue Shield PPO and Health Select plans. Specific information regarding your insurance coverage will be reviewed during your new patient appointment. Please note that insurance does not cover chiropractic care for children under 5 years of age, or maintenance and wellness care.',
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
        { label: 'Weekly Prepaid Visits', unit: '/year', values: [1836, 2652, 3315, 3315, 3978] },
        { label: 'Biweekly Prepaid Visits', unit: '/year', values: [1173, 1683, 2091, 1999, 2299] },
      ],
    },
    images: {
      portraitCutout: '/img/locations/college-station/portrait-cutout.png',
      portraitCutoutAlt:
        'Dr. Ashley seated with two smiling young children on her lap',
      portraitStudio: '/img/locations/college-station/portrait-studio.jpg',
      portraitStudioAlt:
        'Dr. Ashley seated, holding a smiling baby girl wearing a pink bow',
      specialties: {
        'pregnancy-care': '/img/locations/college-station/pregnancy-care.jpg',
        'pediatric-care': '/img/locations/college-station/pediatric-care.jpg',
        'family-wellness-care':
          '/img/locations/college-station/family-wellness-care.jpg',
      },
      specialtiesAlt: {
        'pregnancy-care':
          'Dr. Ashley adjusting the mid-back of a pregnant patient lying on an adjusting table',
        'pediatric-care':
          'A laughing baby lying on an adjusting table while a chiropractor gently supports their head',
        'family-wellness-care':
          'Dr. Ashley showing a toddler how an adjustment works using a doll on the table',
      },
    },
  },
];

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

/** Digits-only phone for `tel:` links, e.g. '+14075847900'. */
export function telHref(phone: string): string {
  return `+1${phone.replace(/\D/g, '')}`;
}
