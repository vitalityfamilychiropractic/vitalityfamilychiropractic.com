import { getEntry } from 'astro:content';
import type { Location } from '../config/types';

/** Team member content entry, failing the build on an unknown slug. */
export async function getMember(slug: string) {
  const entry = await getEntry('team', slug);
  if (!entry) throw new Error(`Missing src/content/team/${slug}.md`);
  return entry;
}

/**
 * This office's team, in `location.team` order. Profiles live in
 * `src/content/team/` and do not carry a sort field of their own.
 */
export async function teamFor(location: Location) {
  return Promise.all(location.team.map((slug) => getMember(slug)));
}

export function displayName(member: { name: string; credentials?: string }): string {
  return member.credentials ? `${member.name}, ${member.credentials}` : member.name;
}

/**
 * Two letters for a portrait stand-in. Two names use the first and last
 * initials. One name uses its first two letters, so Mikayla is "Mi".
 */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2);
}
