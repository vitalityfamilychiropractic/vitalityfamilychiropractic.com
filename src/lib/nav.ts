import { site } from '../config/site';
import type { Location } from '../config/types';
import { servicesFor } from './services';

export interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
  /** A button that opens the menu, rather than a link to a section page. */
  heading?: boolean;
  /**
   * Drawn in gray. Set when Shop is turned off in `site.ts` and this is the
   * dev server, so the link can still be opened.
   */
  devOnly?: boolean;
}

/**
 * The navigation for a single office. Every href is prefixed with the
 * location's slug, so each office reads as a standalone site.
 *
 * Massage is a child of Our Care, and only at offices that offer it.
 * Shop is the same for every office. `site.shop.inNav` turns it off in
 * production; the dev server keeps the gray link.
 */
export async function buildNav(location: Location): Promise<NavItem[]> {
  const services = await servicesFor(location);
  const base = `/${location.slug}`;

  const items: NavItem[] = [
    {
      label: 'Our Care',
      heading: true,
      children: services.map((service) => ({
        label: service.data.navLabel,
        href: `${base}/our-care/${service.id}/`,
      })),
    },
    { label: 'Meet Our Team', href: `${base}/meet-our-team/` },
    {
      label: 'Gather & Grow',
      href: `${base}/our-community/`,
      children: [
        { label: 'What’s Happening at VFC', href: `${base}/our-community/classes-events/` },
        { label: 'Community Partners', href: `${base}/our-community/community-partners/` },
      ],
    },
    {
      label: 'New Patients',
      heading: true,
      children: [
        { label: 'Your First Visit', href: `${base}/new-patients/first-visit/` },
        { label: 'Pricing & Insurance', href: `${base}/new-patients/pricing-insurance/` },
      ],
    },
  ];

  if (site.shop.inNav || import.meta.env.DEV) {
    items.push({
      label: 'Shop',
      href: `${base}/shop/`,
      devOnly: !site.shop.inNav,
    });
  }

  items.push({ label: 'Contact', href: `${base}/contact/` });
  return items;
}

/** Normalise for comparison — trailing slash and case differences aside. */
function normalise(path: string): string {
  const p = path.split('?')[0]!.split('#')[0]!.toLowerCase();
  return p.endsWith('/') ? p : `${p}/`;
}

/** True when `href` is the page currently being rendered. */
export function isCurrent(href: string | undefined, pathname: string): boolean {
  if (!href) return false;
  return normalise(href) === normalise(pathname);
}

/** True when `item` is, or contains, the page currently being rendered. */
export function isAncestor(item: NavItem, pathname: string): boolean {
  if (isCurrent(item.href, pathname)) return true;
  return (item.children ?? []).some((child) => isCurrent(child.href, pathname));
}
