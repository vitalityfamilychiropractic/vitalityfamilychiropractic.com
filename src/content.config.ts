import { defineCollection } from 'astro:content';
// Not `from 'astro:content'` — that re-export was deprecated in Astro 6 and
// removed in 7.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Shared prose. These files are written once and rendered for every location.
 *
 * Body copy may use the token `{{lead}}`, which is replaced at render time
 * with the office lead's short name for the location being rendered — so the
 * pregnancy page reads "Dr. Christie" in Celebration and "Dr. Ashley" in
 * College Station from one source file. See `src/lib/tokens.ts` for the full
 * list of tokens.
 */

const specialties = defineCollection({
  loader: glob({ base: './src/content/specialties', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /** Meta description and card summary. */
    summary: z.string(),
    /** Optional standfirst shown above the body copy. */
    standfirst: z.string().optional(),
    /** Sort order for the specialty nav and cards. */
    order: z.number(),
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    standfirst: z.string().optional(),
    /** Last substantive revision — shown on the privacy policy. */
    updated: z.string().optional(),
  }),
});

export const collections = { specialties, pages };
