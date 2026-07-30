/**
 * Years-in-practice, derived from a start date rather than stored as a number
 * so it can never go stale in the config.
 *
 * The same arithmetic runs twice: once here at build time to put a real number
 * in the HTML (so it is correct for search engines and for anyone with
 * scripting off), and once in the browser on load, so a page that was built
 * months ago — or is being served from a CDN or bfcache — still shows the right
 * figure. See `src/components/PracticeYears.astro`.
 */

/**
 * Whole years elapsed between `startDate` and `now`.
 *
 * Counts completed years only: someone who started on 1 September 2011 is "13
 * years" until 1 September 2025, then "14".
 *
 * @param startDate ISO date, `YYYY-MM-DD`.
 */
export function yearsOfPractice(startDate: string, now: Date = new Date()): number {
  const start = parseIsoDate(startDate);

  let years = now.getFullYear() - start.getFullYear();

  // Roll back a year if the anniversary has not come round yet.
  const month = now.getMonth() - start.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < start.getDate())) {
    years -= 1;
  }

  return Math.max(0, years);
}

/** `14 years`, or `1 year`. */
export function formatYears(years: number): string {
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}

/**
 * Parsed as local time. `new Date('2011-09-01')` would be parsed as UTC and
 * could land on 31 August in western timezones, shifting the anniversary by a
 * day.
 */
function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(
      `practiceStartDate must be an ISO date like "2011-09-01", got "${value}". Check src/config/team.ts.`,
    );
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}
