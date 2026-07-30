import type { Location } from '../config/types';
import type { SpecialtySummary } from './specialties';

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

/**
 * The navigation for a single office. Every href is prefixed with the
 * location's slug, so each office reads as a standalone site.
 *
 * `specialties` is passed in rather than imported because the set differs
 * between offices — resolve it with `getSpecialtiesFor(location)`.
 */
export function buildNav(
  location: Location,
  specialties: SpecialtySummary[],
): NavItem[] {
  const base = `/${location.slug}`;

  const items: NavItem[] = [
    { label: 'Home', href: `${base}/` },
    {
      label: 'About Us',
      href: `${base}/our-values/`,
      children: [
        { label: 'Our Values', href: `${base}/our-values/` },
        { label: 'Team', href: `${base}/team/` },
        { label: 'Pricing', href: `${base}/pricing/` },
      ],
    },
  ];

  // An office with no specialty pages simply has no Specialties menu, rather
  // than an empty dropdown.
  if (specialties.length > 0) {
    items.push({
      label: 'Specialties',
      href: `${base}/specialties/${specialties[0]!.slug}/`,
      children: specialties.map((s) => ({
        label: s.title,
        href: `${base}/specialties/${s.slug}/`,
      })),
    });
  }

  items.push({ label: 'Contact Us', href: `${base}/contact/` });

  return items;
}

/** Normalise for comparison — trailing slash and case differences aside. */
function normalise(path: string): string {
  const p = path.split('?')[0]!.split('#')[0]!.toLowerCase();
  return p.endsWith('/') ? p : `${p}/`;
}

/** True when `href` is the page currently being rendered. */
export function isCurrent(href: string, pathname: string): boolean {
  return normalise(href) === normalise(pathname);
}

/** True when `item` is, or contains, the page currently being rendered. */
export function isAncestor(item: NavItem, pathname: string): boolean {
  if (isCurrent(item.href, pathname)) return true;
  return (item.children ?? []).some((c) => isCurrent(c.href, pathname));
}
