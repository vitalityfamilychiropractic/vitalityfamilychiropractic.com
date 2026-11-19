/**
 * Contact-form handler shared by the Pages Function and the tests.
 *
 * Pages Functions do not get a `send_email` binding (it is not in the Pages
 * bindings list). Delivery uses the Email Sending REST API. The token and
 * account id come from the environment, never from the repo.
 *
 * Field values stay in the POST body and in the email. Redirects are path-only.
 */

import { locations } from '../config/locations';
import {
  CONTACT_TO,
  DEFAULT_CONTACT_FROM_EMAIL,
  DEFAULT_CONTACT_FROM_NAME,
  PREVIEW_CONTACT_TO,
  site,
} from '../config/site';

/** Cloudflare Pages production branch. Preview branches are everything else. */
export const PRODUCTION_BRANCH = 'main';

/** Production inbox on `main`. Preview inbox on every other branch, including when the branch is unset. */
export function contactRecipient(
  branch: string | undefined,
  productionTo = CONTACT_TO,
  previewTo = PREVIEW_CONTACT_TO,
): string {
  return branch === PRODUCTION_BRANCH ? productionTo : previewTo;
}

/** Same subject the previous form sent in its `_subject` field. */
export function contactSubject(officeName: string): string {
  return `Message — ${officeName} (${site.name})`;
}

const FROM_ADDRESS = /^[a-z0-9][a-z0-9._+-]{0,63}@vitalityfamilychiropractic\.com$/i;
const ACCOUNT_ID = /^[a-f0-9]{32}$/i;
const EMAIL =
  /^[a-z0-9._%+-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const PHONE = /^[0-9+().\s-]{7,40}$/;
const CONTACT_METHODS = new Set(['Email', 'Phone call']);
const TURNSTILE_ACTION = 'contact';

const NAME_MAX = 100;
const EMAIL_MAX = 254;
const PHONE_MAX = 40;
const COMMENTS_MAX = 4000;
const BODY_MAX = 32 * 1024;
const TOKEN_MAX = 2048;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const DEFAULT_HOSTS = ['www.vitalityfamilychiropractic.com', 'vitalityfamilychiropractic.com'];
const DEFAULT_TURNSTILE_HOSTS = ['www.vitalityfamilychiropractic.com', 'vitalityfamilychiropractic.com'];

export interface ContactEnv {
  CLOUDFLARE_ACCOUNT_ID?: string;
  EMAIL_API_TOKEN?: string;
  /** Optional. Must be an address at vitalityfamilychiropractic.com. */
  CONTACT_FROM?: string;
  /** Set by Cloudflare Pages. `main` is production; anything else is a preview. */
  CF_PAGES_BRANCH?: string;
  /** Optional. Runtime secret from the Turnstile widget. */
  TURNSTILE_SECRET?: string;
  /** Optional comma-separated hostnames siteverify must return. */
  TURNSTILE_HOSTNAMES?: string;
  /** Optional extra browser hostnames allowed to POST, comma-separated. */
  CONTACT_ALLOWED_HOSTS?: string;
}

export interface ContactDeps {
  fetch?: typeof fetch;
  now?: () => number;
  /** Inbox override. Defaults to the branch selected in site settings. */
  to?: string;
  fromName?: string;
  fromEmail?: string;
}

const hits = new Map<string, number[]>();

/** Clears the in-isolate rate limit. Tests call this between cases. */
export function resetContactLimits(): void {
  hits.clear();
}

export function handleContact(
  request: Request,
  env: ContactEnv,
  deps: ContactDeps = {},
): Promise<Response> {
  const fetchImpl = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  return handle(request, env, fetchImpl, now, deps);
}

async function handle(
  request: Request,
  env: ContactEnv,
  fetchImpl: typeof fetch,
  now: () => number,
  deps: ContactDeps,
): Promise<Response> {
  if (request.method !== 'POST') {
    return plain(405, 'Method not allowed', { Allow: 'POST' });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!isFormContentType(contentType)) {
    return finish(request, { type: 'plain', status: 415, text: 'Unsupported media type' });
  }

  const advertised = Number(request.headers.get('content-length') ?? '');
  if (Number.isFinite(advertised) && advertised > BODY_MAX) {
    return finish(request, { type: 'plain', status: 413, text: 'Message is too large' });
  }

  const originError = checkOrigin(request, env);
  if (originError) return originError;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return finish(request, { type: 'plain', status: 400, text: 'That form could not be read' });
  }

  let total = 0;
  for (const value of form.values()) {
    if (typeof value === 'string') total += value.length;
  }
  if (total > BODY_MAX) {
    return clientError(request, form, 413, 'Message is too large');
  }

  if (limited(clientIp(request), now())) {
    return clientError(request, form, 429, 'Too many messages. Please wait a few minutes and try again.');
  }

  if (honeypotTripped(form)) {
    return clientSuccess(request, form);
  }

  const turnstile = await verifyTurnstile(request, form, env, fetchImpl);
  if (!turnstile.ok) {
    return clientError(
      request,
      form,
      403,
      'Please complete the verification and try again.',
    );
  }

  const parsed = parseFields(form);
  if (!parsed.ok) return clientError(request, form, 400, parsed.error);

  const from = senderAddress(env, deps.fromEmail);
  if (!from) {
    console.error('Contact form rejected CONTACT_FROM');
    return clientError(request, form, 503, NOT_READY);
  }
  const fromName = singleLine(deps.fromName ?? DEFAULT_CONTACT_FROM_NAME);
  if (!fromName) {
    console.error('Contact form is missing a from name');
    return clientError(request, form, 503, NOT_READY);
  }

  const accountId = (env.CLOUDFLARE_ACCOUNT_ID ?? '').trim();
  const token = (env.EMAIL_API_TOKEN ?? '').trim();
  if (!ACCOUNT_ID.test(accountId) || token.length === 0 || /[\u0000-\u001F\u007F]/.test(token)) {
    console.error('Contact form email is not configured');
    return clientError(request, form, 503, NOT_READY);
  }

  const sent = await sendEmail(fetchImpl, accountId, token, {
    to: deps.to ?? contactRecipient(env.CF_PAGES_BRANCH),
    from,
    fromName,
    replyTo: parsed.email,
    subject: contactSubject(parsed.location.name),
    text: messageBody(parsed),
  });
  if (!sent) return clientError(request, form, 502, SEND_FAILED);
  return clientSuccess(request, form);
}

const NOT_READY = 'This form is not ready to send yet. Please email us or call.';
const SEND_FAILED = 'Sorry, we could not send that. Please email us or call.';

interface ParsedFields {
  ok: true;
  location: { slug: string; name: string };
  name: string;
  email: string;
  phone: string;
  contactMethod: string;
  comments: string;
}

function parseFields(form: FormData): ParsedFields | { ok: false; error: string } {
  const office = textField(form, 'office');
  const location = locations.find((item) => item.slug === office);
  if (!location) return { ok: false, error: 'Please choose an office and try again.' };

  const name = singleLine(textField(form, 'name'));
  if (!name) return { ok: false, error: 'Name is required.' };
  if (name.length > NAME_MAX) return { ok: false, error: 'Name is too long.' };

  const emailRaw = textField(form, 'email').trim();
  if (!emailRaw) return { ok: false, error: 'Email is required.' };
  if (emailRaw.length > EMAIL_MAX || /[\u0000-\u001F\u007F]/.test(emailRaw) || !EMAIL.test(emailRaw)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  const phone = singleLine(textField(form, 'phone'));
  if (phone.length > PHONE_MAX || (phone.length > 0 && !PHONE.test(phone))) {
    return { ok: false, error: 'Please check the phone number.' };
  }

  const contactMethod = singleLine(textField(form, 'contactMethod'));
  if (contactMethod.length > 40 || (contactMethod.length > 0 && !CONTACT_METHODS.has(contactMethod))) {
    return { ok: false, error: 'Please choose a contact method.' };
  }

  const comments = messageText(textField(form, 'comments'));
  if (!comments) return { ok: false, error: 'A message is required.' };
  if (comments.length > COMMENTS_MAX) return { ok: false, error: 'Message is too long.' };

  return { ok: true, location, name, email: emailRaw, phone, contactMethod, comments };
}

function messageBody(fields: ParsedFields): string {
  return [
    `office: ${fields.location.slug}`,
    `name: ${fields.name}`,
    `email: ${fields.email}`,
    `phone: ${fields.phone}`,
    `contactMethod: ${fields.contactMethod}`,
    'comments:',
    fields.comments,
  ].join('\n');
}

function senderAddress(env: ContactEnv, fallback = DEFAULT_CONTACT_FROM_EMAIL): string | null {
  const configured = (env.CONTACT_FROM ?? '').trim();
  if (!configured) return FROM_ADDRESS.test(fallback) ? fallback : null;
  return FROM_ADDRESS.test(configured) ? configured : null;
}

interface OutboundMail {
  to: string;
  from: string;
  fromName: string;
  replyTo: string;
  subject: string;
  text: string;
}

async function sendEmail(
  fetchImpl: typeof fetch,
  accountId: string,
  token: string,
  mail: OutboundMail,
): Promise<boolean> {
  const subject = singleLine(mail.subject);
  const replyTo = mail.replyTo;
  if (!subject || !EMAIL.test(replyTo) || /[\r\n]/.test(replyTo)) return false;

  let response: Response;
  try {
    response = await fetchImpl(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [mail.to],
          from: { address: mail.from, name: mail.fromName },
          reply_to: replyTo,
          subject,
          text: mail.text,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'error';
    console.error(`Contact email request failed: ${reason}`);
    return false;
  }

  let payload: {
    success?: boolean;
    errors?: Array<{ code?: number }>;
    result?: { delivered?: string[]; queued?: string[] };
  } | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const delivered = payload?.result?.delivered?.length ?? 0;
  const queued = payload?.result?.queued?.length ?? 0;
  if (response.ok && payload?.success === true && delivered + queued > 0) return true;

  const code = payload?.errors?.[0]?.code;
  console.error(`Contact email was rejected (${response.status}${code ? `, code ${code}` : ''})`);
  return false;
}

async function verifyTurnstile(
  request: Request,
  form: FormData,
  env: ContactEnv,
  fetchImpl: typeof fetch,
): Promise<{ ok: boolean }> {
  const secret = (env.TURNSTILE_SECRET ?? '').trim();
  if (!secret) return { ok: true };

  const token = textField(form, 'cf-turnstile-response');
  // Turnstile needs JavaScript. A normal browser navigation still posts.
  if (!token) return { ok: !wantsJson(request) };
  if (token.length > TOKEN_MAX || /[\u0000-\u001F\u007F]/.test(token)) return { ok: false };

  const requestHost = new URL(request.url).hostname.toLowerCase();
  const expected = hostSet(env.TURNSTILE_HOSTNAMES, [...DEFAULT_TURNSTILE_HOSTS, requestHost]);
  if (expected.size === 0) return { ok: false };

  let response: Response;
  try {
    response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: clientIp(request),
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'error';
    console.error(`Turnstile siteverify failed: ${reason}`);
    return { ok: false };
  }

  if (!response.ok) return { ok: false };

  let result: { success?: boolean; action?: string; hostname?: string };
  try {
    result = await response.json();
  } catch {
    return { ok: false };
  }

  const hostname = (result.hostname ?? '').toLowerCase();
  return {
    ok: result.success === true && result.action === TURNSTILE_ACTION && expected.has(hostname),
  };
}

function honeypotTripped(form: FormData): boolean {
  return textField(form, '_gotcha').length > 0 || textField(form, 'botcheck').length > 0;
}

function checkOrigin(request: Request, env: ContactEnv): Response | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  let hostname: string;
  try {
    hostname = new URL(origin).hostname.toLowerCase();
  } catch {
    return plain(403, 'Forbidden');
  }
  const requestHost = new URL(request.url).hostname.toLowerCase();
  // The page that served the form is this host, including Pages previews.
  if (hostname === requestHost) return null;
  const local = requestHost === 'localhost' || requestHost === '127.0.0.1';
  const allowed = hostSet(env.CONTACT_ALLOWED_HOSTS, [
    ...DEFAULT_HOSTS,
    ...(local ? ['localhost', '127.0.0.1'] : []),
  ]);
  if (allowed.has(hostname)) return null;
  return wantsJson(request)
    ? json({ ok: false, error: 'This form only accepts messages from the practice website.' }, 403)
    : plain(403, 'Forbidden');
}

function hostSet(extra: string | undefined, defaults: string[]): Set<string> {
  const values = [...defaults, ...(extra ?? '').split(',')];
  return new Set(values.map((host) => host.trim().toLowerCase()).filter(Boolean));
}

function limited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clientIp(request: Request): string {
  const ip = (request.headers.get('cf-connecting-ip') ?? '').trim();
  return ip || 'unknown';
}

function wantsJson(request: Request): boolean {
  const accept = request.headers.get('accept') ?? '';
  return accept.split(',').some((part) => part.split(';')[0]?.trim().toLowerCase() === 'application/json');
}

function textField(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
}

function isFormContentType(contentType: string): boolean {
  const media = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
  return media === 'application/x-www-form-urlencoded' || media === 'multipart/form-data';
}

/** One line, with header-injection characters removed. */
function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

/** Message text. Newlines stay. Other control characters do not. */
function messageText(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

type ClientResult =
  | { type: 'plain'; status: number; text: string }
  | { type: 'json'; status: number; error?: string }
  | { type: 'redirect'; slug: string; page: 'thanks' | 'error' };

function clientSuccess(request: Request, form: FormData): Response {
  if (wantsJson(request)) return json({ ok: true }, 200);
  const slug = knownSlug(form);
  if (!slug) return plain(200, 'Thank you. Your message has been sent.');
  return redirect(request, slug, 'thanks');
}

function clientError(request: Request, form: FormData, status: number, error: string): Response {
  if (wantsJson(request)) return json({ ok: false, error }, status);
  const slug = knownSlug(form);
  if (!slug) return plain(status, 'That form could not be sent.');
  return redirect(request, slug, 'error');
}

function knownSlug(form: FormData): string | null {
  const office = textField(form, 'office').trim();
  return locations.some((item) => item.slug === office) ? office : null;
}

function finish(request: Request, result: ClientResult): Response {
  if (result.type === 'plain') return plain(result.status, result.text);
  if (result.type === 'json') return json(result.error ? { ok: false, error: result.error } : { ok: true }, result.status);
  return redirect(request, result.slug, result.page);
}

/** Path only. The request URL's query string is not copied. */
function redirect(request: Request, slug: string, page: 'thanks' | 'error'): Response {
  const url = new URL(`/${slug}/contact/${page}/`, request.url);
  url.search = '';
  url.hash = '';
  return new Response(null, {
    status: 303,
    headers: {
      Location: url.pathname,
      'cache-control': 'no-store',
    },
  });
}

function json(body: { ok: boolean; error?: string }, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function plain(status: number, text: string, extra?: HeadersInit): Response {
  const headers = new Headers(extra);
  headers.set('content-type', 'text/plain; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(text, { status, headers });
}
