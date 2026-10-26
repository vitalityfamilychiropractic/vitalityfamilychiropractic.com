/**
 * Same-origin calendar feed for the classes page.
 * The browser cannot read Google's public iCal address (no CORS), so this
 * handler fetches it and returns the cards as JSON. Each visit reads the
 * feed again, which drops an event once Google has removed it.
 */

import { locations } from '../config/locations';
import { upcomingEvents } from './events';

const MAX_DAYS = 366;

export async function eventsResponse(url: URL): Promise<Response> {
  const office = url.searchParams.get('office') ?? '';
  const location = locations.find((item) => item.slug === office);
  if (!location) return json({ error: 'Unknown office' }, 404);
  const days = Number(url.searchParams.get('days'));
  if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
    return json({ error: 'days must be a positive whole number' }, 400);
  }
  try {
    const events = await upcomingEvents(location.eventsCalendarId, days);
    return json(events, 200);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Events calendar for ${office} failed: ${reason}`);
    return json({ error: 'Calendar unavailable' }, 502);
  }
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
