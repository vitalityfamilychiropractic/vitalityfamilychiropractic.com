/**
 * Practice values — shared across every location, shown on the Our Values page
 * and (the first three) on each office's home page.
 *
 * `headline` is pulled out and set as the page's pull quote; the rest render as
 * cards. `label` is the short eyebrow above each card.
 */

export const valuesHeadline =
  'We want your visit to our office to be the best 15 minutes of your week.';

export interface ValueStatement {
  label: string;
  body: string;
}

export const values: ValueStatement[] = [
  {
    label: 'Care',
    body: 'We love you, your children, and the people and things that are important to you.',
  },
  {
    label: 'Family',
    body: 'You are a part of our family, and we look forward to seeing you on a regular basis.',
  },
  {
    label: 'Expertise',
    body: 'We value continuing education and providing the best chiropractic care for you and your family in all stages of your life.',
  },
  {
    label: 'Community',
    body: 'We value community, laughter, joy, and connection.',
  },
  {
    label: 'Innate health',
    body: 'We believe in the body’s innate ability to be healthy and strive to optimize that potential through regular chiropractic care.',
  },
];
