import { displayName } from '../config/team';
import type { TeamMember, Location } from '../config/types';

/**
 * Shared prose is written once for every office, so anywhere it needs to name
 * a person or a place it uses a token instead. The pregnancy page says
 * "{{lead}} is certified in the Webster technique" and renders as
 * "Dr. Christie" in Celebration and "Dr. Ashley" in College Station.
 *
 * Applied to the rendered HTML rather than the markdown source so tokens keep
 * working inside links and emphasis.
 */
export function tokensFor(location: Location, lead: TeamMember) {
  return {
    /** The office's lead, e.g. 'Dr. Christie'. */
    lead: lead.shortName,
    /** The office's lead with post-nominals, e.g. 'Christie McLarty, DC'. */
    leadFull: displayName(lead),
    /** Their job title, e.g. 'Chiropractor'. */
    leadRole: lead.role,

    // Kept working so existing pages do not break. `lead` reads better now
    // that an office's lead need not be a doctor.
    doctor: lead.shortName,
    doctorFull: displayName(lead),

    location: location.name,
    city: location.address.city,
    state: location.address.state,
    phone: location.phone,
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
