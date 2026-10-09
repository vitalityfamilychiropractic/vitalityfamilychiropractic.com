import { getEntry } from 'astro:content';
import { getMember } from '../config/team';
import { applyTokens, tokensFor } from './tokens';
import type { Location } from '../config/types';

/**
 * Meta description for a shared page. The wording lives in that page's
 * content file; the office name, place, lead, and phone come from the
 * location being rendered.
 */
export async function pageDescription(id: string, location: Location): Promise<string> {
  const entry = await getEntry('pages', id);
  if (!entry) throw new Error(`Missing src/content/pages/${id}.md`);

  const description = applyTokens(
    entry.data.summary,
    tokensFor(location, getMember(location.lead)),
  ).trim();
  if (!description) {
    throw new Error(`src/content/pages/${id}.md has no summary to use as the meta description.`);
  }
  return description;
}
