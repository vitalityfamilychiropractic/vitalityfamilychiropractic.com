import { getEntry } from 'astro:content';
import { formatStreet, formatCityLine, getLocation, telHrefFormatted } from '../config/locations';
import { applyTokens, tokensFor } from './tokens';
import { getMember } from './team';
import type { Location } from '../config/types';

/**
 * Meta description for a shared page. The wording lives in that page's
 * content file; the office name, place, lead, and phone come from the
 * location being rendered.
 */
export async function pageDescription(id: string, location: Location): Promise<string> {
  const entry = await getEntry('pages', id);
  if (!entry) throw new Error(`Missing src/content/pages/${id}.md`);
  const lead = await getMember(location.lead);

  const description = applyTokens(entry.data.summary, tokensFor(location, lead.data)).trim();
  if (!description) {
    throw new Error(`src/content/pages/${id}.md has no summary to use as the meta description.`);
  }
  return description;
}

/**
 * Privacy-policy HTML with the contact block filled from `primaryOffice`.
 * The same policy file is served at `/privacy/` and at each office.
 */
export function privacyHtml(entry: {
  data: { primaryOffice?: string };
  rendered?: { html: string };
}): string {
  const slug = entry.data.primaryOffice;
  if (!slug) {
    throw new Error('src/content/pages/privacy.md must set primaryOffice to a location slug.');
  }
  const html = entry.rendered?.html;
  if (!html) {
    throw new Error('src/content/pages/privacy.md has no rendered HTML.');
  }
  const office = getLocation(slug);
  return applyTokens(html, {
    formatStreet: formatStreet(office),
    formatCityLine: formatCityLine(office),
    zip: office.address.zip,
    email: office.email,
    telHrefFormatted: telHrefFormatted(office.phone),
  });
}
