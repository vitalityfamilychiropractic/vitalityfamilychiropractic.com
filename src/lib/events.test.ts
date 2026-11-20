import { afterEach, expect, test } from 'bun:test';
import { upcomingEvents } from './events';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('loads the calendar without the unimplemented cache field', async () => {
  let init: RequestInit & { cf?: { cacheTtl?: number; cacheEverything?: boolean } } | undefined;
  globalThis.fetch = (async (_input: RequestInfo | URL, next?: RequestInit) => {
    init = next;
    return new Response('BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n');
  }) as typeof fetch;

  const events = await upcomingEvents('calendar@group.calendar.google.com', 7, new Date('2026-06-01T12:00:00Z'));
  expect(events).toEqual([]);
  expect(init).toBeDefined();
  expect(init).not.toHaveProperty('cache');
  expect(init?.cf).toEqual({ cacheTtl: 0, cacheEverything: false });
  expect(new Headers(init?.headers).get('cache-control')).toBe('no-cache');
});
