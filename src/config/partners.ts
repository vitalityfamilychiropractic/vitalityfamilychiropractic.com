/**
 * Community partners. Which offices show them, and in what order, is
 * `location.partners`. An office with an empty array publishes the
 * introduction only. The entries are nonsense stand-ins, not real
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
  {
    slug: 'bramble-pudding',
    name: 'Bramble Pudding',
    profession: 'Nap Sommelier',
    business: 'The Afternoon Drawer',
    summary:
      'Bramble pairs each family with a nap of the correct vintage, then files the leftover yawns in a drawer labeled for Tuesdays.',
    phone: '(555) 010-0201',
    email: 'bramble@example.com',
    website: 'https://example.com/afternoon-drawer',
  },
  {
    slug: 'cinder-moth',
    name: 'Cinder Moth',
    profession: 'Doula of Lost Socks',
    business: 'The Matching Bureau',
    summary:
      'Cinder attends laundry day with a lantern and a solemn promise that one sock is only traveling, not gone.',
    phone: '(555) 010-0202',
    email: 'cinder@example.com',
    website: 'https://example.com/matching-bureau',
  },
  {
    slug: 'waffle-birch',
    name: 'Waffle Birch',
    profession: 'Childbirth Librarian',
    business: 'The Quiet Stack',
    summary:
      'Waffle stamps due dates into the card catalog and whispers the call number for a story that ends with everyone fed.',
    phone: '(555) 010-0203',
    email: 'waffle@example.com',
    website: 'https://example.com/quiet-stack',
  },
  {
    slug: 'pickle-orchid',
    name: 'Pickle Orchid',
    profession: 'Posture Meteorologist',
    business: 'The Small Forecast',
    summary:
      'Pickle predicts a light chance of slouching after lunch and recommends carrying a tiny umbrella made of good intentions.',
    phone: '(555) 010-0204',
    email: 'pickle@example.com',
    website: 'https://example.com/small-forecast',
  },
  {
    slug: 'marzipan-gull',
    name: 'Marzipan Gull',
    profession: 'Lullaby Accountant',
    business: 'The Counting Blanket',
    summary:
      'Marzipan balances the books of bedtime, where every verse is a deposit and every extra verse is a rounding error.',
    phone: '(555) 010-0205',
    email: 'marzipan@example.com',
    website: 'https://example.com/counting-blanket',
  },
  {
    slug: 'thistle-bongo',
    name: 'Thistle Bongo',
    profession: 'Newborn Acoustician',
    business: 'The Soft Gong',
    summary:
      'Thistle tunes the room until a sigh and a floorboard agree on a note, then bows to the crib and leaves the gong unstruck.',
    phone: '(555) 010-0206',
    email: 'thistle@example.com',
    website: 'https://example.com/soft-gong',
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

