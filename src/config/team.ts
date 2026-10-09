import type { TeamMember } from './types';

/**
 * Everyone who appears on a team page, defined exactly once here and referenced
 * by slug from `locations.ts`. Someone who works at more than one office
 * appears on both team pages from this single record.
 */
export const team: TeamMember[] = [
  {
    slug: 'christie-mclarty',
    name: 'Christie McLarty',
    shortName: 'Dr. Christie',
    welcomeName: 'Dr Christie',
    credentials: 'DC',
    role: 'Chiropractor',
    schemaType: 'Physician',
    certifications: 'CACCP, Webster plus perinatal certified',
    specialty: 'Prenatal, Pediatric, and Family Wellness Care',
    practiceStartDate: '2011-09-22',
    email: 'drchristie@vitalityfamilychiropractic.com',
    facebook: 'drchristiemclarty',
    photo: '/assets/img/team/christie-mclarty.jpg',
    signature: '/assets/img/dr-christie-sig.webp',
    signatureAlt: 'Signature of Dr Christie',
    summary:
      'Dr. Christie McLarty founded Vitality Family Chiropractic in College Station and now also practices in Celebration, Florida. CACCP and Webster certified.',
    bio: [
      'Dr. Christie received her Doctor of Chiropractic Degree from Palmer College of Chiropractic in Port Orange, FL in 2011. She also holds a degree in Biomedical Sciences from Auburn University. She has received advanced training in spinal correction, toxicity, exercise and nutrition from some of the largest health care clinics in the world in Denver, Chicago, and The Woodlands, TX.',
      'Dr. Christie’s deepest passion lies in taking care of families, specifically pregnant women and children. She knows that her greatest impact can be made by teaching children to take care of their bodies from birth. Her youngest patients get adjusted soon after birth- some merely an hour old. Her vision is to see a world where people and families achieve abundant health and are living up to their God-given potential. Dr. Christie is a member of the ICPA, is certified in the Webster Technique with an additional perinatal certification, and holds a board certification from The Council of Chiropractic Pediatrics of The Academy of Chiropractic Family Practice (CACCP). She has had advanced training in chiropractic cranial corrections and is actively pursuing her Pediatric SOT certification.',
      'Dr. Christie moved to College Station, TX in 2011 and built the largest family wellness clinic in the Brazos Valley. She worked with thousands of patients and saw them through multiple pregnancies, infancies, child-hood and beyond. Dr. Christie worked extensively with local obstetricians, pediatricians, midwives, pediatric and airway focused dentists, physical therapists, doulas, lactation consultants, and speech therapists to provide the best coordinated care possible with positive patient outcomes at the forefront of these relationships.',
      'After 13 years in Texas, Dr. Christie was ready to be a Floridian again and fulfilled a life-long dream of moving to Celebration, FL. She is so thrilled to open her second office location in Celebration and enjoys life here with her husband Nick and daughter Mackenzie. Her husband Nick serves as the Deputy Chief Information Security Officer for the Texas A&M University System and Mackenzie is in fifth grade. In her free time she loves to explore everything Florida has to offer, travel, play pickleball, cook, craft, read, and spend time with her family.',
    ],
    practiceMix: [
      { label: 'Prenatal', percent: 40 },
      { label: 'Pediatric', percent: 30 },
      { label: 'Family Wellness', percent: 30 },
    ],
    priorities: [
      'Helping you live life to the fullest',
      'Supporting families through their healthcare decisions',
      'Special needs populations',
      'Birth, breast-feeding, and intentional parenting',
      'Creating a welcoming, loving experience for your family',
    ],
    community: [
      'Dr. Christie’s favorite part of being a chiropractor is the relationships she builds with her patients.  Being a wellness chiropractor allows for us to get to know each other in a way that  resembles a friendship more than a doctor-patient relationship.',
      'Dr. Christie loves supporting local businesses and “doing life” with her patients and their businesses.  She is available for lunch and learn presentations, corporate wellness programs on site, and is always excited to serve as needed in the community.',
      'Please reach out if you feel we could be of service in any way.',
    ],
    locationHighlights: {
      celebration: [
        'The only chiropractor in the Orlando metro area south of Altamonte Springs certified by the Academy Council on Chiropractic Pediatrics (CACCP)',
      ],
      'college-station': [
        'Practicing in College Station for over a decade',
      ],
    },
    highlights: [
      'Relentlessly devoted to serving families with the highest quality of customer experience and chiropractic care',
      'Most specialized pregnancy-related chiropractic care with <a class="link-primary" href="https://icpa4kids.com/training/webster-certification/webster-technique/">Webster Technique</a> plus Perinatal certified through the ICPA',
      'Extensive training in chiropractic cranial corrections',
    ],
    passions: [
      'Generational Family Wellness Care',
      'Community and Relationships',
      'Birth',
      'Breastfeeding',
      'Continuing Education',
    ],
  },
];

const bySlug = new Map(team.map((member) => [member.slug, member]));

/**
 * Experience bullets for one office: that office's lines first, then the
 * lines shared by every office.
 */
export function highlightsFor(member: TeamMember, locationSlug: string): string[] {
  return [
    ...(member.locationHighlights?.[locationSlug] ?? []),
    ...(member.highlights ?? []),
  ];
}

/** Look up a team member, failing the build loudly on an unknown slug. */
export function getMember(slug: string): TeamMember {
  const member = bySlug.get(slug);
  if (!member) {
    throw new Error(
      `Unknown team member slug "${slug}". Check the \`team\` and \`lead\` fields in src/config/locations.ts against the slugs defined in src/config/team.ts. Known slugs: ${[...bySlug.keys()].join(', ')}.`,
    );
  }
  return member;
}

/**
 * Heading for a specialty page's contact card. Derived from the member's role
 * so a new kind of practitioner labels itself.
 */
export function roleLabel(member: TeamMember): string {
  return `Your ${member.role.toLowerCase()}`;
}

/**
 * Name as it should be printed — "Christie McLarty, DC", or just the name for
 * anyone without post-nominals.
 */
export function displayName(member: TeamMember): string {
  return member.credentials ? `${member.name}, ${member.credentials}` : member.name;
}
