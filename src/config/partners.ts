/**
 * Community partners. Which offices show them, and in what order, is
 * `location.partners`. An office with an empty array publishes the
 * introduction only. These three are nonsense stand-ins, not real
 * local professionals.
 */

import type { Location } from './types';

export interface Partner {
  slug: string;
  name: string;
  profession: string;
  business?: string;
  summary: string;
  phone?: string;
  email?: string;
  website?: string;
}

export const partners: Partner[] = [
  {
    slug: 'pebble-quince',
    name: 'Pebble Quince',
    profession: 'Cloud Midwife',
    business: 'The Hovering Cradle',
    summary:
      'Pebble attends births that happen slightly to the left of the room, and sends each family home with a weather report folded into a receiving blanket.',
    phone: '(555) 010-0142',
    email: 'pebble@example.com',
    website: 'https://example.com/hovering-cradle',
  },
  {
    slug: 'juniper-latchkey',
    name: 'Juniper Latchkey',
    profession: 'Lactation Cartographer',
    business: 'Map & Milk',
    summary:
      'Juniper draws feeding routes in fountain-pen green, including the scenic overlook where naps tend to happen and the shortcut behind the bookshelf.',
    phone: '(555) 010-0177',
    email: 'juniper@example.com',
    website: 'https://example.com/map-and-milk',
  },
  {
    slug: 'noodle-fern',
    name: 'Noodle Fern',
    profession: 'Pelvic Floor Dramaturge',
    business: 'The Soft Proscenium',
    summary:
      'Noodle stages very quiet one-act plays about posture, with intermissions for stretching and a standing ovation that is mostly just standing.',
    phone: '(555) 010-0194',
    email: 'noodle@example.com',
    website: 'https://example.com/soft-proscenium',
  },
];

const partnersBySlug = new Map(partners.map((partner) => [partner.slug, partner]));

/** This office's partners, in `location.partners` order. */
export function partnersFor(location: Location): Partner[] {
  return location.partners.map((slug) => {
    const partner = partnersBySlug.get(slug);
    if (!partner) {
      throw new Error(
        `${location.slug} lists partner "${slug}", but that slug is not in src/config/partners.ts.`,
      );
    }
    return partner;
  });
}

