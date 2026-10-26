import { site } from '../config/site';
import { facebookHref, formatAddress, formatStreet } from '../config/locations';
import { photoFor } from '../config/photos';
import type { Location, StaffSummary } from '../config/types';

/**
 * schema.org markup for one office, generated entirely from its config entry.
 * Hours come only from machine-readable ranges, so a display-only Saturday
 * stays out of the structured data.
 */
export function localBusinessSchema(
  location: Location,
  team: StaffSummary[],
  /** Titles of the services this office offers. */
  services: string[],
  /** Office home-page description, already filled in for this location. */
  description: string,
) {
  const url = `${site.url}/${location.slug}/`;

  const openingHours = location.hours.flatMap((entry) =>
    (entry.machine ?? []).map(([opens, closes]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${entry.day}`,
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
    description,
    url,
    telephone: location.phone,
    email: location.email,
    image: new URL(photoFor(location, { id: 'landing-office' }).src, site.url).href,
    logo: `${site.url}${site.logoRaster}`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: formatStreet(location),
      addressLocality: location.address.city,
      addressRegion: location.address.stateAbbr,
      ...(location.hidePostalCode ? {} : { postalCode: location.address.zip }),
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.geo.lat,
      longitude: location.geo.lng,
    },
    hasMap: location.mapUrl,
    openingHoursSpecification: openingHours,
    sameAs: [facebookHref(location)],
    medicalSpecialty: 'Chiropractic',
    areaServed: location.areaServed.map((name) => ({
      '@type': 'AdministrativeArea',
      name,
    })),
    availableService: services.map((name) => ({
      '@type': 'MedicalTherapy',
      name,
    })),
    employee: team.map((member) => ({
      '@type': member.schemaType,
      name: member.credentials ? `${member.name}, ${member.credentials}` : member.name,
      jobTitle: member.role,
      url: `${url}meet-our-team/#${member.slug}`,
      ...(member.email ? { email: member.email } : {}),
      ...(member.schemaType === 'Physician' ? { medicalSpecialty: 'Chiropractic' } : {}),
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
export function breadcrumbSchema(crumbs: Array<{ name: string; href: string }>) {
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
export function organizationSchema(offices: Location[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}${site.logoRaster}`,
    email: site.email,
    sameAs: [facebookHref(site)],
    department: offices.map((office) => ({
      '@type': 'Chiropractor',
      '@id': `${site.url}/${office.slug}/`,
      name: `${site.name} — ${office.name}`,
      url: `${site.url}/${office.slug}/`,
      telephone: office.phone,
      address: formatAddress(office),
    })),
  };
}
