import { site } from '../config/site';
import { formatAddress, locationDescription } from '../config/locations';
import type { TeamMember, Location } from '../config/types';

const DAY_NAMES: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

/**
 * schema.org markup for one office, generated entirely from its config entry —
 * a new location gets correct structured data with no extra work.
 */
export function localBusinessSchema(
  location: Location,
  team: TeamMember[],
  /** Titles of the specialties this office offers, e.g. 'Pregnancy Care'. */
  services: string[],
) {
  const url = `${site.url}/${location.slug}/`;

  const openingHours = location.hours.flatMap((entry) =>
    (entry.machine ?? []).map(([opens, closes]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DAY_NAMES[entry.day] ?? entry.day}`,
      opens,
      closes,
    })),
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Chiropractor',
    '@id': url,
    name: `${site.name} — ${location.name}`,
    legalName: site.legalName,
    description: locationDescription(location),
    url,
    telephone: location.phone,
    email: location.email,
    image: `${site.url}${location.images.portraitStudio}`,
    logo: `${site.url}${site.logoRaster}`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: [location.address.street, location.address.street2]
        .filter(Boolean)
        .join(' '),
      addressLocality: location.address.city,
      addressRegion: location.address.stateAbbr,
      postalCode: location.address.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.geo.lat,
      longitude: location.geo.lng,
    },
    hasMap: location.mapUrl,
    openingHoursSpecification: openingHours,
    sameAs: [site.social.facebook],
    medicalSpecialty: 'Chiropractic',
    areaServed: location.areaServed.map((name) => ({
      '@type': 'AdministrativeArea',
      name,
    })),
    // Taken from the office's own specialty list, so an office offering
    // massage therapy advertises it and one that does not, does not.
    availableService: services.map((name) => ({
      '@type': 'MedicalTherapy',
      name,
    })),
    employee: team.map((m) => ({
      // Only licensed clinicians are `Physician`; a massage therapist or an
      // assistant is a plain `Person`.
      '@type': m.schemaType,
      name: m.credentials ? `${m.name}, ${m.credentials}` : m.name,
      jobTitle: m.role,
      url: `${url}team/${m.slug}/`,
      email: m.email,
      ...(m.schemaType === 'Physician'
        ? { medicalSpecialty: 'Chiropractic' }
        : {}),
    })),
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: location.bookingUrl,
        actionPlatform: 'https://schema.org/DesktopWebPlatform',
      },
      result: { '@type': 'Reservation', name: 'Chiropractic appointment' },
    },
  };
}

/** Breadcrumb trail for a page inside a location. */
export function breadcrumbSchema(
  crumbs: Array<{ name: string; href: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${site.url}${crumb.href}`,
    })),
  };
}

/** Organization-level markup for the location chooser at the site root. */
export function organizationSchema(locations: Location[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}${site.logoRaster}`,
    email: site.email,
    sameAs: [site.social.facebook],
    department: locations.map((l) => ({
      '@type': 'Chiropractor',
      '@id': `${site.url}/${l.slug}/`,
      name: `${site.name} — ${l.name}`,
      url: `${site.url}/${l.slug}/`,
      telephone: l.phone,
      address: formatAddress(l),
    })),
  };
}
