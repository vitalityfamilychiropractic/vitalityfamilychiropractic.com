import { getCollection, getEntry } from 'astro:content';
import type { Location } from '../config/types';

/** One service, failing the build on an unknown slug. */
export async function getService(slug: string) {
  const entry = await getEntry('services', slug);
  if (!entry) throw new Error(`Missing src/content/services/${slug}.md`);
  return entry;
}

/** This office's services, in `location.services` order. */
export async function servicesFor(location: Location) {
  const all = await getCollection('services');
  const byId = new Map(all.map((entry) => [entry.id, entry]));
  return location.services.map((slug) => {
    const entry = byId.get(slug);
    if (!entry) {
      throw new Error(
        `${location.slug} lists service "${slug}", but src/content/services/${slug}.md does not exist.`,
      );
    }
    return entry;
  });
}
