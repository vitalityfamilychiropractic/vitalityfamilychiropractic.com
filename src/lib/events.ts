/**
 * Upcoming events for one office, read from its public Google Calendar.
 * The feed is the calendar's public iCal address. The calendar has to be
 * public, or Google returns no events.
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  /** Inclusive start, as an ISO timestamp. */
  start: string;
  /** Exclusive end for all-day events, as an ISO timestamp. */
  end: string;
  allDay: boolean;
  dateLabel: string;
  timeLabel: string;
}

interface Wall {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

interface Rule {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  count?: number;
  until?: Date;
  byday: string[];
  bymonthday: number[];
}

interface RawEvent {
  uid: string;
  recurrenceId?: Date;
  cancelled: boolean;
  title: string;
  description: string;
  start: Date;
  end: Date;
  allDay: boolean;
  /** Zone the event repeats in. */
  timeZone: string;
  /** Zone the office calendar uses for the labels on the card. */
  displayZone: string;
  rule: Rule | null;
  exdates: number[];
}

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;
const FREQS = new Set(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

export async function upcomingEvents(
  calendarId: string,
  withinDays: number,
  now = new Date(),
): Promise<CalendarEvent[]> {
  const url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;
  let response: Response;
  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not reach the Google Calendar for "${calendarId}": ${reason}`);
  }
  if (!response.ok) {
    throw new Error(
      `Google Calendar "${calendarId}" returned ${response.status}. The calendar needs to be public.`,
    );
  }
  const ics = await response.text();
  if (!ics.includes('BEGIN:VCALENDAR')) {
    throw new Error(
      `Google Calendar "${calendarId}" did not return a calendar. The calendar needs to be public.`,
    );
  }
  return eventsFromIcs(ics, withinDays, now);
}

/** Parse an iCal feed and keep events that are underway or still ahead. */
export function eventsFromIcs(ics: string, withinDays: number, now = new Date()): CalendarEvent[] {
  if (!Number.isInteger(withinDays) || withinDays < 1) {
    throw new Error(`eventsWithinDays must be a positive whole number. Received ${withinDays}.`);
  }
  const calendarZone = calendarTimeZone(ics);
  const raw = parseEvents(unfold(ics), calendarZone);
  const windowEnd = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  const events = materialize(raw, now, windowEnd);
  events.sort((a, b) => a.start.getTime() - b.start.getTime() || a.title.localeCompare(b.title));
  return events.map((event, index) => toCard(event, index));
}

function unfold(ics: string): string {
  return ics.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

function calendarTimeZone(ics: string): string {
  const match = ics.match(/X-WR-TIMEZONE:([^\r\n]+)/);
  return match?.[1]?.trim() || 'UTC';
}

function parseEvents(ics: string, calendarZone: string): RawEvent[] {
  const events: RawEvent[] = [];
  const chunks = ics.split('BEGIN:VEVENT').slice(1);
  for (const chunk of chunks) {
    const body = chunk.split('END:VEVENT')[0] ?? '';
    const props = properties(body);
    const startProp = props.find((prop) => prop.name === 'DTSTART');
    if (!startProp) continue;
    const start = parseWhen(startProp, calendarZone);
    const endProp = props.find((prop) => prop.name === 'DTEND');
    const end = endProp
      ? parseWhen(endProp, start.timeZone).date
      : new Date(start.date.getTime() + (start.allDay ? 24 : 1) * 60 * 60 * 1000);
    const ruleProp = props.find((prop) => prop.name === 'RRULE');
    const exdates = props
      .filter((prop) => prop.name === 'EXDATE')
      .flatMap((prop) =>
        prop.value.split(',').map((value) => parseWhen({ ...prop, value: value.trim() }, start.timeZone).date.getTime()),
      );
    const recurrence = props.find((prop) => prop.name === 'RECURRENCE-ID');
    events.push({
      uid: valueOf(props, 'UID') || `${start.date.toISOString()}-${events.length}`,
      recurrenceId: recurrence ? parseWhen(recurrence, start.timeZone).date : undefined,
      cancelled: valueOf(props, 'STATUS').toUpperCase() === 'CANCELLED',
      title: unescapeText(valueOf(props, 'SUMMARY')).trim(),
      description: plainDescription(valueOf(props, 'DESCRIPTION')),
      start: start.date,
      end,
      allDay: start.allDay,
      timeZone: start.timeZone,
      displayZone: calendarZone,
      rule: ruleProp ? parseRule(ruleProp.value, start.timeZone) : null,
      exdates,
    });
  }
  return events;
}

interface Prop {
  name: string;
  params: Record<string, string>;
  value: string;
}

function properties(block: string): Prop[] {
  const props: Prop[] = [];
  for (const line of block.split('\n')) {
    if (!line || line.startsWith('BEGIN:') || line.startsWith('END:')) continue;
    const splitAt = line.indexOf(':');
    if (splitAt < 0) continue;
    const left = line.slice(0, splitAt);
    const [name, ...rawParams] = left.split(';');
    const params: Record<string, string> = {};
    for (const raw of rawParams) {
      const eq = raw.indexOf('=');
      if (eq > 0) params[raw.slice(0, eq).toUpperCase()] = raw.slice(eq + 1).replace(/^"(.*)"$/, '$1');
    }
    props.push({ name: (name ?? '').toUpperCase(), params, value: line.slice(splitAt + 1) });
  }
  return props;
}

function valueOf(props: Prop[], name: string): string {
  return props.find((prop) => prop.name === name)?.value ?? '';
}

function unescapeText(value: string): string {
  return value.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}

/** Google often stores the description as a small HTML fragment. */
function plainDescription(value: string): string {
  return unescapeText(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<\/?p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseWhen(prop: Prop, fallbackZone: string): { date: Date; allDay: boolean; timeZone: string } {
  const timeZone = prop.params.TZID || fallbackZone;
  const allDay = prop.params.VALUE === 'DATE' || /^\d{8}$/.test(prop.value);
  if (allDay) {
    const wall = wallFromParts(prop.value.slice(0, 4), prop.value.slice(4, 6), prop.value.slice(6, 8), '0', '0', '0');
    return { date: wallToUtc(wall, timeZone), allDay: true, timeZone };
  }
  const match = prop.value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!match) throw new Error(`Could not read a calendar date "${prop.value}".`);
  const wall = wallFromParts(match[1], match[2], match[3], match[4], match[5], match[6]);
  if (match[7] === 'Z') {
    return {
      date: new Date(Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second)),
      allDay: false,
      timeZone,
    };
  }
  return { date: wallToUtc(wall, timeZone), allDay: false, timeZone };
}

function wallFromParts(year: string, month: string, day: string, hour: string, minute: string, second: string): Wall {
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };
}

function parseRule(value: string, timeZone: string): Rule | null {
  const parts = Object.fromEntries(
    value.split(';').map((part) => {
      const eq = part.indexOf('=');
      return [part.slice(0, eq).toUpperCase(), part.slice(eq + 1)];
    }),
  );
  const freq = parts.FREQ;
  if (!freq || !FREQS.has(freq)) return null;
  const until = parts.UNTIL ? parseWhen({ name: 'UNTIL', params: {}, value: parts.UNTIL }, timeZone).date : undefined;
  return {
    freq: freq as Rule['freq'],
    interval: Math.max(1, Number(parts.INTERVAL) || 1),
    count: parts.COUNT ? Number(parts.COUNT) : undefined,
    until,
    byday: parts.BYDAY ? parts.BYDAY.split(',') : [],
    bymonthday: parts.BYMONTHDAY ? parts.BYMONTHDAY.split(',').map(Number) : [],
  };
}

function materialize(raw: RawEvent[], now: Date, windowEnd: Date): RawEvent[] {
  const groups = new Map<string, RawEvent[]>();
  for (const event of raw) {
    const list = groups.get(event.uid) ?? [];
    list.push(event);
    groups.set(event.uid, list);
  }
  const visible: RawEvent[] = [];
  for (const series of groups.values()) {
    const master = series.find((event) => !event.recurrenceId);
    const overrides = new Map(
      series.filter((event) => event.recurrenceId).map((event) => [event.recurrenceId!.getTime(), event]),
    );
    const seeds = master ? expand(master, now, windowEnd) : series;
    for (const event of seeds) {
      const override = overrides.get(event.start.getTime());
      const chosen = override ?? event;
      if (chosen.cancelled) continue;
      if (chosen.end > now && chosen.start < windowEnd) visible.push(chosen);
    }
  }
  return visible;
}

function expand(master: RawEvent, now: Date, windowEnd: Date): RawEvent[] {
  if (!master.rule || master.cancelled) return [master];
  const rule = master.rule;
  const duration = master.end.getTime() - master.start.getTime();
  const limit = rule.until && rule.until < windowEnd ? rule.until : windowEnd;
  const count = rule.count ?? Number.POSITIVE_INFINITY;
  const excluded = new Set(master.exdates);
  const seriesStart = wallInZone(master.start, master.timeZone);
  // A repeating event may have begun years ago. Start near today unless COUNT
  // has to be tallied from the first instance.
  const lookback = wallInZone(new Date(now.getTime() - duration - 36 * 60 * 60 * 1000), master.timeZone);
  const cursor = rule.count || compareWall(seriesStart, lookback) >= 0 ? seriesStart : jumpTo(seriesStart, lookback, rule);
  const occurrences: RawEvent[] = [];
  let produced = rule.count ? 0 : occurrencesBefore(seriesStart, cursor, rule);
  for (const wall of occurrenceWalls(seriesStart, cursor, rule)) {
    if (produced >= count) break;
    const start = wallToUtc(wall, master.timeZone);
    produced += 1;
    if (start > limit || (rule.until && start > rule.until)) break;
    if (excluded.has(start.getTime())) continue;
    const end = new Date(start.getTime() + duration);
    if (start >= windowEnd) break;
    if (end <= now) continue;
    occurrences.push({ ...master, start, end, rule: null, recurrenceId: undefined });
  }
  return occurrences;
}

/** Move a long-running series up to the week, month, or year that contains `lookback`. */
function jumpTo(start: Wall, lookback: Wall, rule: Rule): Wall {
  if (rule.freq === 'DAILY') {
    const skip = Math.max(0, Math.floor(daysBetween(start, lookback) / rule.interval));
    return addDays(start, skip * rule.interval);
  }
  if (rule.freq === 'WEEKLY') {
    const origin = addDays(start, -((weekday(start) + 6) % 7));
    const monday = addDays(lookback, -((weekday(lookback) + 6) % 7));
    const weeks = Math.floor(daysBetween(origin, monday) / 7);
    const aligned = Math.floor(weeks / rule.interval) * rule.interval;
    return addDays(origin, Math.max(0, aligned) * 7);
  }
  if (rule.freq === 'MONTHLY') {
    const months = (lookback.year - start.year) * 12 + (lookback.month - start.month) - 1;
    return addMonths(start, Math.max(0, Math.floor(months / rule.interval)) * rule.interval);
  }
  const years = lookback.year - start.year - 1;
  return addMonths(start, Math.max(0, Math.floor(years / rule.interval)) * rule.interval * 12);
}

function occurrencesBefore(start: Wall, cursor: Wall, rule: Rule): number {
  if (compareWall(cursor, start) <= 0) return 0;
  if (rule.freq === 'DAILY') return Math.floor(daysBetween(start, cursor) / rule.interval);
  if (rule.freq === 'WEEKLY') {
    const days = rule.byday.length || 1;
    return Math.floor(daysBetween(start, cursor) / (7 * rule.interval)) * days;
  }
  if (rule.freq === 'MONTHLY') {
    const months = (cursor.year - start.year) * 12 + (cursor.month - start.month);
    const each = rule.byday.length || rule.bymonthday.length || 1;
    return Math.floor(months / rule.interval) * each;
  }
  const years = cursor.year - start.year;
  return Math.floor(years / rule.interval);
}

function* occurrenceWalls(start: Wall, cursor: Wall, rule: Rule): Generator<Wall> {
  if (rule.freq === 'DAILY') {
    for (let step = 0; step < 500; step += 1) yield addDays(cursor, step * rule.interval);
    return;
  }
  if (rule.freq === 'WEEKLY') {
    const days = (rule.byday.length ? rule.byday : [WEEKDAYS[weekday(start)]]).map((code) =>
      WEEKDAYS.indexOf(code as (typeof WEEKDAYS)[number]),
    );
    const weekOrigin = addDays(cursor, -((weekday(cursor) + 6) % 7));
    for (let week = 0; week < 80; week += 1) {
      const base = addDays(weekOrigin, week * rule.interval * 7);
      for (const day of days) {
        const occ = withTime(addDays(base, (day + 6) % 7), start);
        if (compareWall(occ, start) < 0 || compareWall(occ, cursor) < 0) continue;
        yield occ;
      }
    }
    return;
  }
  if (rule.freq === 'MONTHLY') {
    for (let step = 0; step < 36; step += 1) {
      const month = addMonths(cursor, step * rule.interval);
      if (rule.byday.length) {
        for (const token of rule.byday) {
          const occ = nthWeekdayOfMonth(month, token, start);
          if (occ && compareWall(occ, start) >= 0 && compareWall(occ, cursor) >= 0) yield occ;
        }
      } else {
        const days = rule.bymonthday.length ? rule.bymonthday : [start.day];
        for (const day of days) {
          const occ = clampDay({ ...month, day }, start);
          if (occ && compareWall(occ, start) >= 0 && compareWall(occ, cursor) >= 0) yield occ;
        }
      }
    }
    return;
  }
  for (let step = 0; step < 20; step += 1) {
    const occ = addMonths(cursor, step * rule.interval * 12);
    if (compareWall(occ, start) >= 0 && compareWall(occ, cursor) >= 0) yield occ;
  }
}

function daysBetween(a: Wall, b: Wall): number {
  const start = Date.UTC(a.year, a.month - 1, a.day);
  const end = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

function nthWeekdayOfMonth(month: Wall, token: string, time: Wall): Wall | null {
  const match = token.match(/^([+-]?\d)?(SU|MO|TU|WE|TH|FR|SA)$/);
  if (!match?.[2]) return null;
  const weekdayIndex = WEEKDAYS.indexOf(match[2] as (typeof WEEKDAYS)[number]);
  const ordinal = match[1] ? Number(match[1]) : 0;
  const first = { ...month, day: 1 };
  if (!ordinal) {
    const delta = (weekdayIndex - weekday(first) + 7) % 7;
    return withTime(addDays(first, delta), time);
  }
  if (ordinal > 0) {
    const delta = (weekdayIndex - weekday(first) + 7) % 7;
    return withTime(addDays(first, delta + (ordinal - 1) * 7), time);
  }
  const last = new Date(Date.UTC(month.year, month.month, 0));
  const lastWall = { year: last.getUTCFullYear(), month: last.getUTCMonth() + 1, day: last.getUTCDate(), hour: 0, minute: 0, second: 0 };
  const delta = (weekday(lastWall) - weekdayIndex + 7) % 7;
  return withTime(addDays(lastWall, -(delta + (Math.abs(ordinal) - 1) * 7)), time);
}

function clampDay(wall: Wall, time: Wall): Wall | null {
  const probe = new Date(Date.UTC(wall.year, wall.month - 1, wall.day));
  if (probe.getUTCMonth() !== wall.month - 1) return null;
  return withTime(wall, time);
}

function addMonths(wall: Wall, months: number): Wall {
  const index = wall.month - 1 + months;
  const year = wall.year + Math.floor(index / 12);
  const month = ((index % 12) + 12) % 12;
  const dim = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return { ...wall, year, month: month + 1, day: Math.min(wall.day, dim) };
}

function addDays(wall: Wall, days: number): Wall {
  const next = new Date(Date.UTC(wall.year, wall.month - 1, wall.day + days));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
    hour: wall.hour,
    minute: wall.minute,
    second: wall.second,
  };
}

function withTime(wall: Wall, time: Wall): Wall {
  return { ...wall, hour: time.hour, minute: time.minute, second: time.second };
}

function weekday(wall: Wall): number {
  return new Date(Date.UTC(wall.year, wall.month - 1, wall.day)).getUTCDay();
}

function compareWall(a: Wall, b: Wall): number {
  return (
    a.year - b.year ||
    a.month - b.month ||
    a.day - b.day ||
    a.hour - b.hour ||
    a.minute - b.minute ||
    a.second - b.second
  );
}

function wallInZone(date: Date, timeZone: string): Wall {
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts: Record<string, string> = {};
  for (const part of format.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function wallToUtc(wall: Wall, timeZone: string): Date {
  const wanted = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  let ms = wanted;
  for (let pass = 0; pass < 3; pass += 1) {
    const seen = wallInZone(new Date(ms), timeZone);
    const seenUtc = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute, seen.second);
    ms += wanted - seenUtc;
  }
  return new Date(ms);
}

function toCard(event: RawEvent, index: number): CalendarEvent {
  return {
    id: `event-${index + 1}`,
    title: event.title || 'Untitled event',
    description: event.description,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    allDay: event.allDay,
    dateLabel: dateLabel(event),
    timeLabel: event.allDay
      ? 'All day'
      : `${clock(event.start, event.displayZone)}–${clock(event.end, event.displayZone)}`,
  };
}

function dateLabel(event: RawEvent): string {
  const zone = event.allDay ? event.timeZone : event.displayZone;
  const last = event.allDay ? new Date(event.end.getTime() - 1) : event.end;
  const start = wallInZone(event.start, zone);
  const end = wallInZone(last, zone);
  if (start.year === end.year && start.month === end.month && start.day === end.day) {
    return longDate(event.start, zone);
  }
  if (start.year === end.year && start.month === end.month) {
    return `${monthName(event.start, zone)} ${start.day}–${end.day}, ${start.year}`;
  }
  if (start.year === end.year) {
    return `${monthName(event.start, zone)} ${start.day}–${monthName(last, zone)} ${end.day}, ${start.year}`;
  }
  return `${longDate(event.start, zone)}–${longDate(last, zone)}`;
}

function longDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function monthName(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone, month: 'long' }).format(date);
}

function clock(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
