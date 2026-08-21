import type { TeamMember } from './types';

/**
 * Everyone who appears on a team page, defined exactly once here and referenced
 * by slug from `locations.ts`. Someone who works at more than one office
 * (Dr. Christie currently does) appears on both team pages from this single
 * record — there is no second copy of the bio to keep in sync.
 *
 * Not everyone here has to be a chiropractor. `role` is what a page calls the
 * person — "Your massage therapist", "Your chiropractor" — and `schemaType`
 * is how search engines read them, so adding a therapist or an assistant needs
 * no code changes.
 */
export const team: TeamMember[] = [
  {
    slug: 'christie-mclarty',
    name: 'Christie McLarty',
    shortName: 'Dr. Christie',
    credentials: 'DC',
    role: 'Chiropractor',
    schemaType: 'Physician',
    certifications: 'CACCP, Webster plus perinatal certified',
    specialty: 'Prenatal, Pediatric, and Family Wellness Care',
    practiceStartDate: '2011-09-22',
    email: 'drchristie@vitalityfamilychiropractic.com',
    photo: '/img/team/christie-mclarty.jpg',
    signature: '/img/team/christie-mclarty-signature.webp',
    signatureAlt: 'Dr. Christie’s handwritten signature',
    bio: [
      'Dr. Christie received her Doctor of Chiropractic Degree from Palmer College of Chiropractic in Port Orange, FL in 2011. She also holds a degree in Biomedical Sciences from Auburn University. She has received advanced training in spinal correction, toxicity, exercise and nutrition from some of the largest health care clinics in the world in Denver, Chicago, and The Woodlands, TX.',
      'Dr. Christie’s deepest passion lies in taking care of families, specifically pregnant women and children. She knows that her greatest impact can be made by teaching children to take care of their bodies from birth. Her youngest patients get adjusted soon after birth — some merely an hour old. Her vision is to see a world where people and families achieve abundant health and are living up to their God-given potential. Dr. Christie is a member of the ICPA, is certified in the Webster Technique with an additional perinatal certification, and holds a board certification from The Council of Chiropractic Pediatrics of The Academy of Chiropractic Family Practice (CACCP). She has had advanced training in chiropractic cranial corrections and is actively pursuing her Pediatric SOT certification.',
      'Dr. Christie moved to College Station, TX in 2011 and built the largest family wellness clinic in the Brazos Valley. She worked with thousands of patients and saw them through multiple pregnancies, infancies, childhood and beyond. Dr. Christie worked extensively with local obstetricians, pediatricians, midwives, pediatric and airway focused dentists, physical therapists, doulas, lactation consultants, and speech therapists to provide the best coordinated care possible with positive patient outcomes at the forefront of these relationships.',
      'After 13 years in Texas, Dr. Christie was ready to be a Floridian again and fulfilled a life-long dream of moving to Celebration, FL. She is so thrilled to open her second office location in Celebration and enjoys life here with her husband Nick and daughter Mackenzie. Her husband Nick serves as the Deputy Chief Information Security Officer for the Texas A&M University System and Mackenzie is in third grade. In her free time she loves to explore everything Florida has to offer, travel, play pickleball, cook, craft, read, and spend time with her family.',
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
      'Birth, breastfeeding, and intentional parenting',
      'Creating a welcoming, loving experience for your family',
    ],
    community: [
      'Dr. Christie’s favorite part of being a chiropractor is the relationships she builds with her patients. Being a wellness chiropractor allows for us to get to know each other in a way that resembles a friendship more than a doctor-patient relationship.',
      'Dr. Christie loves supporting local businesses and “doing life” with her patients and their businesses. She is available for lunch and learn presentations, corporate wellness programs on site, and is always excited to serve as needed in the community.',
      'Please reach out if you feel we could be of service in any way.',
    ],
    highlights: [
      'Relentlessly devoted to serving families with the highest quality of customer experience and chiropractic care',
      'The only chiropractor in the Orlando metro area south of Altamonte Springs certified by the Academy Council on Chiropractic Pediatrics (CACCP)',
      'Most specialized pregnancy-related chiropractic care with Webster Technique plus Perinatal certified through the ICPA',
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
  {
    slug: 'ashley-harmon',
    name: 'Ashley Harmon',
    shortName: 'Dr. Ashley',
    credentials: 'DC',
    role: 'Chiropractor',
    schemaType: 'Physician',
    certifications: 'Webster Technique, Activator Certified, cAVCA',
    specialty: 'Prenatal, Pediatric, and Family Wellness Care',
    practiceStartDate: '2024-01-18',
    email: 'drashley@vitalityfamilychiropractic.com',
    photo: '/img/team/ashley-harmon.jpg',
    signature: '/img/team/ashley-harmon-signature.png',
    signatureAlt: 'Dr. Ashley’s handwritten signature',
    bio: [
      'Dr. Ashley received her Doctor of Chiropractic Degree from Parker University in Dallas, TX in 2023. She also holds a bachelors degree in Health and Wellness and Anatomy as well as a Masters degree in Strength and Human Performance from Parker University.',
      'Dr. Ashley has a passion for taking care of families with children of all ages. This passion resulted from her experience of growing up as the oldest of 6 children. She also has a passion for taking care of athletes. Her 15 years of dedication to the sport of swimming as well as 2 years as a coach has had a profound impact on how she views the importance of recovery while pushing the body to its limit on a daily basis. Her goal is to provide patient centered care while educating families on the importance of overall health and wellness.',
      'Dr. Ashley is a member of the ICPA, is certified in Webster Technique, and is actively pursuing her board certification from The Council of Chiropractic Pediatrics of The Academy of Chiropractic Family Practice (CACCP).',
      'Dr. Ashley is from Richmond, TX. In her free time, she likes to exercise, play pickleball, quilt, swim, coach, and spend time with her family.',
    ],
    practiceMix: [
      { label: 'Prenatal', percent: 40 },
      { label: 'Pediatric', percent: 30 },
      { label: 'Family Wellness', percent: 30 },
    ],
    priorities: [
      'Serving and educating families about the benefits of wellness care',
      'Creating a welcoming experience for your family',
      'Cultivating relationships with patients',
    ],
    community: [
      'Dr. Ashley finds the most rewarding aspect of her chiropractic practice in the strong relationships she forms with her patients while helping them reach their health and wellness goals. She enjoys creating a welcoming experience for patients and their families.',
      'Dr. Ashley is passionate about supporting local businesses and enjoys being actively involved in the lives of her patients and their ventures.',
    ],
    highlights: [
      'Webster Technique certified',
      'Chiropractic cranial correction',
      'Currently enrolled in pediatric and prenatal certification through the ICPA',
      'Activator certified',
      'AVCA Certified Animal Chiropractor',
    ],
    passions: [
      'Family Wellness Care',
      'Building Relationships',
      'Pregnancy and Birth',
      'Continuing Education',
    ],
  },
  {
    // Not a clinician, so only the fields that are actually true of her.
    // Add `certifications`, `photo`, `bio` and the rest whenever there is
    // something real to put in them — each page starts showing them on its own.
    slug: 'candice-ashburn',
    name: 'Candice Ashburn',
    shortName: 'Candice',
    credentials: 'LMT',
    role: 'Massage Therapist',
    schemaType: 'Person',
    practiceStartDate: '2021-11-10',
    email: 'candice@vitalityfamilychiropractic.com',
  },
];

const bySlug = new Map(team.map((member) => [member.slug, member]));

/**
 * Look up a team member, failing the build loudly if a location references a
 * slug that does not exist.
 */
export function getMember(slug: string): TeamMember {
  const member = bySlug.get(slug);
  if (!member) {
    throw new Error(
      `Unknown team member slug "${slug}". Check the \`team\`, \`lead\` and \`specialtyLeads\` fields in src/config/locations.ts against the slugs defined in src/config/team.ts. Known slugs: ${[...bySlug.keys()].join(', ')}.`,
    );
  }
  return member;
}

/**
 * Heading for a specialty page's contact card. Derived from the member's role
 * so a massage therapist reads "Your massage therapist" without configuration.
 */
export function roleLabel(member: TeamMember): string {
  return `Your ${member.role.toLowerCase()}`;
}

/**
 * Name as it should be printed — "Christie McLarty, DC", or just the name for
 * anyone without post-nominals, rather than a stray trailing comma.
 */
export function displayName(member: TeamMember): string {
  return member.credentials ? `${member.name}, ${member.credentials}` : member.name;
}
