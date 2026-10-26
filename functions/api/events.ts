/**
 * Cloudflare Pages serves this at /api/events.
 * `astro dev` answers the same path from the Vite plugin in astro.config.mjs.
 */

import { eventsResponse } from '../../src/lib/events-api';

export function onRequestGet(context: { request: Request }): Promise<Response> {
  return eventsResponse(new URL(context.request.url));
}
