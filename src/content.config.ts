import { defineCollection } from 'astro:content';
// Not `from 'astro:content'` — that re-export was deprecated in Astro 6 and
// removed in 7.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Shared prose. These files are written once and rendered for every location.
 * Body copy and `summary` may use tokens such as `{{city}}` and `{{phone}}`,
 * replaced at render time. See `src/lib/tokens.ts`.
 *
 * `sections` is validated loosely on purpose. The renderer walks the array,
 * and an unknown key should survive the build rather than being stripped.
 */

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /** Meta description for an office page. May use tokens filled from that office. */
    summary: z.string(),
    /**
     * Meta description for the same page when it is not under an office.
     * Used by the brand privacy page, whose summary names a city.
     */
    brandSummary: z.string().optional(),
    /**
     * Location slug whose street, email, and phone fill `{{formatStreet}}`,
     * `{{email}}`, and `{{telHrefFormatted}}` in the privacy policy.
     */
    primaryOffice: z.string().optional(),
    /** Last substantive revision — shown on the privacy policy. */
    updated: z.string().optional(),
    /** Contact page aside heading. */
    asideTitle: z.string().optional(),
    /** Contact page aside body. */
    aside: z.string().optional(),
    /** Partners page introduction. Shown even when the partner list is empty. */
    intro: z.string().optional(),
    /**
     * Classes and Events: how many days ahead to list from the office calendar.
     * A section with `showEvents: true` reads this.
     */
    eventsWithinDays: z.number().int().positive().optional(),
    sections: z.array(z.any()).optional(),
  }),
});

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /** Label in the Our Care menu. */
    navLabel: z.string(),
    order: z.number(),
    summary: z.string(),
    /** Home-page card title. May contain HTML entities for `set:html`. */
    cardTitle: z.string(),
    cardText: z.string(),
    /** Photo id from `src/config/photos.ts`. */
    cardImage: z.string(),
    cardSoft: z.boolean().optional(),
    sections: z.array(z.any()).optional(),
  }),
});

/**
 * One file per person. Name, role, portrait, facts, and bio live here.
 * Which offices include them, and in what order, is only `location.team`.
 */
const team = defineCollection({
  loader: glob({ base: './src/content/team', pattern: '**/*.md' }),
  schema: z
    .object({
      name: z.string(),
      shortName: z.string(),
      role: z.string(),
      schemaType: z.enum(['Physician', 'Person']),
      tagline: z.string().optional(),
      factsTitle: z.string(),
      facts: z.array(z.string()),
      /** Photo id. Omit when no portrait exists; the page shows initials. */
      photo: z.string().optional(),
      credentials: z.string().optional(),
      email: z.string().optional(),
    })
    .strict(),
});

export const collections = { pages, services, team };
