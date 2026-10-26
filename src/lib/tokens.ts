import { telHref } from '../config/locations';
import type { Location } from '../config/types';

/** The office lead, as stored on a team content entry. */
export interface TokenLead {
  shortName: string;
  name: string;
  role: string;
  credentials?: string;
}

/**
 * Shared prose is written once for every office, so anywhere it needs to name
 * a person or a place it uses a token instead.
 *
 * Applied to the rendered HTML rather than the markdown source so tokens keep
 * working inside links and emphasis.
 */
export function tokensFor(location: Location, lead: TokenLead) {
  const leadFull = lead.credentials ? `${lead.name}, ${lead.credentials}` : lead.name;
  return {
    /** The office's lead, e.g. 'Dr. Christie'. */
    lead: lead.shortName,
    /** The office's lead with post-nominals, e.g. 'Christie McLarty, DC'. */
    leadFull,
    /** Their job title, e.g. 'Chiropractor'. */
    leadRole: lead.role,

    location: location.name,
    city: location.address.city,
    /** Full state name, e.g. 'Florida'. */
    state: location.address.state,
    /** Two-letter abbreviation, e.g. 'FL'. */
    stateAbbr: location.address.stateAbbr,
    phone: location.phone,
    /** Full telephone link, e.g. 'tel:+14075847900'. */
    phoneHref: `tel:${telHref(location.phone)}`,
    base: `/${location.slug}`,
    bookingUrl: location.bookingUrl,
    homeClaim: location.homeClaim,
    homeBlurb: location.homeBlurb,
    insuranceFaq: location.insuranceFaq,
  } satisfies Record<string, string>;
}

const TOKEN = /\{\{\s*(\w+)\s*\}\}/g;

/** Replace `{{token}}` placeholders. Unknown tokens fail the build. */
export function applyTokens(html: string, values: Record<string, string>): string {
  return html.replace(TOKEN, (match, key: string) => {
    const value = values[key];
    if (value === undefined) {
      throw new Error(
        `Unknown content token "${match}". Available tokens: ${Object.keys(values)
          .map((k) => `{{${k}}}`)
          .join(', ')}.`,
      );
    }
    return value;
  });
}
