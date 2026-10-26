import { getEntry, type CollectionEntry } from 'astro:content';
import { locations } from '../config/locations';
import type { Location } from '../config/types';

export type Partner = NonNullable<CollectionEntry<'pages'>['data']['partners']>[number];

const officeSlugs = new Set(locations.map((location) => location.slug));

/** Partner catalog from `src/content/pages/partners.md`, in display order. */
export async function loadPartners(): Promise<Partner[]> {
  const entry = await getEntry('pages', 'partners');
  if (!entry) throw new Error('Missing src/content/pages/partners.md');
  if (!entry.data.partners) throw new Error('src/content/pages/partners.md is missing partners');
  const seen = new Set<string>();
  for (const partner of entry.data.partners) {
    if (seen.has(partner.slug)) {
      throw new Error(`src/content/pages/partners.md lists partner "${partner.slug}" more than once.`);
    }
    seen.add(partner.slug);
    const listed = new Set<string>();
    for (const slug of partner.locations) {
      if (!officeSlugs.has(slug)) {
        throw new Error(
          `Partner "${partner.slug}" lists location "${slug}", but that slug is not an office in src/config/locations.ts.`,
        );
      }
      if (listed.has(slug)) {
        throw new Error(`Partner "${partner.slug}" lists location "${slug}" more than once.`);
      }
      listed.add(slug);
    }
  }
  return entry.data.partners;
}

/** Partners whose `locations` include this office, in catalog order. */
export async function partnersFor(location: Location): Promise<Partner[]> {
  return (await loadPartners()).filter((partner) => partner.locations.includes(location.slug));
}
