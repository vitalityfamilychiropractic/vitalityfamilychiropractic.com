import { getCollection } from 'astro:content';
import { getMember, roleLabel } from '../config/team';
import type { Location, TeamMember } from '../config/types';

/**
 * Specialty pages are a shared pool: every Markdown file in
 * `src/content/specialties/` is available to any office, and each office's
 * `specialties` array in `locations.ts` decides which of them it actually
 * offers and in what order.
 *
 * So a service only one office provides — massage therapy at College Station —
 * is written once like any other page and simply listed by that one office.
 * Nothing about it is special-cased.
 */
export interface SpecialtySummary {
  slug: string;
  title: string;
  summary: string;
  standfirst?: string;
  /** Sort order for listings that are not scoped to a single office. */
  order: number;
}

let pool: Map<string, SpecialtySummary> | null = null;

async function loadPool(): Promise<Map<string, SpecialtySummary>> {
  if (!pool) {
    const entries = await getCollection('specialties');
    pool = new Map(
      entries.map((entry) => [
        entry.id,
        {
          slug: entry.id,
          title: entry.data.title,
          summary: entry.data.summary,
          standfirst: entry.data.standfirst,
          order: entry.data.order,
        },
      ]),
    );
  }
  return pool;
}

/**
 * The specialties one office offers, in the order that office lists them.
 * A slug with no matching Markdown file fails the build rather than producing
 * a nav link to a 404.
 */
export async function getSpecialtiesFor(
  location: Location,
): Promise<SpecialtySummary[]> {
  const all = await loadPool();

  return location.specialties.map((slug) => {
    const specialty = all.get(slug);
    if (!specialty) {
      throw new Error(
        `Location "${location.slug}" lists specialty "${slug}", but there is no src/content/specialties/${slug}.md. Available: ${[...all.keys()].join(', ')}.`,
      );
    }
    return specialty;
  });
}

/**
 * Every specialty offered by at least one office, deduplicated and sorted by
 * `order`. Used on the brand-level landing page, which belongs to no single
 * office. A file in the pool that no office lists is deliberately left out —
 * drafts should not surface publicly.
 */
export async function getOfferedSpecialties(
  locations: Location[],
): Promise<SpecialtySummary[]> {
  const all = await loadPool();
  const slugs = new Set(locations.flatMap((location) => location.specialties));

  return [...slugs]
    .map((slug) => all.get(slug))
    .filter((s): s is SpecialtySummary => Boolean(s))
    .sort((a, b) => a.order - b.order);
}

/**
 * Who the contact card on a specialty page names, and what it calls them.
 *
 * Resolution order, most specific first:
 *   1. `specialtyLeads[slug].member` — this office assigned someone to this
 *      service, e.g. the massage therapist rather than the lead chiropractor.
 *   2. `location.lead` — the office's usual lead.
 *
 * The heading comes from `specialtyLeads[slug].label` when set, otherwise from
 * the member's own `role`, so adding a new kind of practitioner labels itself.
 */
export function specialtyLead(
  location: Location,
  slug: string,
): { member: TeamMember; label: string } {
  const override = location.specialtyLeads?.[slug];
  const member = getMember(override?.member ?? location.lead);

  return { member, label: override?.label ?? roleLabel(member) };
}

/** The photo and alt text this office uses for a specialty, if it has one. */
export function specialtyImage(location: Location, slug: string) {
  const src = location.images.specialties[slug];
  if (!src) return null;

  return {
    src,
    alt:
      location.images.specialtiesAlt?.[slug] ??
      `Care at our ${location.name} office`,
  };
}
