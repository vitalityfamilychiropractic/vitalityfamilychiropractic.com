import { getEntry } from 'astro:content';
import { getMember } from '../config/team';
import { applyTokens, tokensFor } from './tokens';
import type { Location } from '../config/types';

/**
 * The office home page is one piece of shared writing. City, state, and the
 * lead come from the location being rendered.
 */
export async function homeCopy(location: Location): Promise<{ intro: string; description: string }> {
  const entry = await getEntry('pages', 'home');
  if (!entry) throw new Error('Missing src/content/pages/home.md');

  const values = tokensFor(location, getMember(location.lead));
  const intro = applyTokens(entry.body?.trim() ?? '', values);
  if (!intro) {
    throw new Error('src/content/pages/home.md has no body to show on the office home page.');
  }

  return {
    intro,
    description: applyTokens(entry.data.summary, values),
  };
}
