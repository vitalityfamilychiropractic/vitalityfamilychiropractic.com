import { defineCollection } from 'astro:content';
// Not `from 'astro:content'` — that re-export was deprecated in Astro 6 and
// removed in 7.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Shared prose. These files are written once and rendered for every location.
 *
 * Body copy and the `summary` meta description may use the token `{{lead}}`,
 * which is replaced at render time with the office lead's short name for the
 * location being rendered — so the pregnancy page reads "Dr. Christie" from
 * one source file. See `src/lib/tokens.ts` for the full list of tokens.
 */

const specialties = defineCollection({
  loader: glob({ base: './src/content/specialties', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /** Short label on the home-page feature card, e.g. "Pregnancy". */
    cardLabel: z.string(),
    /** Meta description. May use tokens filled from the office being rendered. */
    summary: z.string(),
    /** Optional standfirst shown above the body copy. */
    standfirst: z.string().optional(),
    /** Sort order for listings that are not scoped to one office. */
    order: z.number(),
  }),
});

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
    standfirst: z.string().optional(),
    /** Last substantive revision — shown on the privacy policy. */
    updated: z.string().optional(),
  }),
});

export const collections = { specialties, pages };
