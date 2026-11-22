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
  PRODUCTION_BRANCH,
} from '../config/site';

export { PRODUCTION_BRANCH };

/** Production inbox on `main`. Preview inbox on every other branch, including when the branch is unset. */
export function contactRecipient(
  branch: string | undefined,
  productionTo = CONTACT_TO,
  previewTo = PREVIEW_CONTACT_TO,
): string {
  return branch === PRODUCTION_BRANCH ? productionTo : previewTo;
}

/** `Message - Office (Visitor)`, with a hyphen and a header-safe name. */
export function contactSubject(officeName: string, visitorName: string): string {
  const name = singleLine(visitorName).slice(0, NAME_MAX);
  return `Message - ${officeName} (${name})`;
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
const PAGE_MAX = 300;
const STAMP_MAX = 200;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

/** How long a signed stamp must age before a post is accepted. */
export const MIN_SUBMIT_MS = 2000;
/** A stamp older than this is stale. The visitor reloads the form. */
const MAX_SUBMIT_MS = 12 * 60 * 60 * 1000;
/** Links (`http://`, `https://`, or `www.`) allowed in a message. */
const MAX_LINKS = 2;

const ALLOWED_FIELDS = new Set([
  'office',
  'page',
  'name',
  'email',
  'phone',
  'contactMethod',
  'comments',
  'cf-turnstile-response',
  'form_loaded',
  'vfc_hp_field',
  // Previous honeypot names. A cached page still posts them empty.
  '_gotcha',
  'botcheck',
]);

/** Filled means a bot. `_gotcha` and `botcheck` are the previous honeypot names. */
const HONEYPOT_FIELDS = ['vfc_hp_field', '_gotcha', 'botcheck'];

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

  if (hasUnexpectedFields(form)) {
    return clientError(request, form, 400, UNEXPECTED_FIELD);
  }

  const stamp = await verifyStamp(form, env, now());
  if (!stamp.ok) return clientError(request, form, 400, stamp.error);

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

  const spam = spamReason(parsed.name, parsed.comments);
  if (spam) return clientError(request, form, 400, spam);

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

  const message = messageBody(parsed);
  const sent = await sendEmail(fetchImpl, accountId, token, {
    to: deps.to ?? contactRecipient(env.CF_PAGES_BRANCH),
    from,
    fromName,
    replyTo: parsed.email,
    subject: contactSubject(parsed.location.name, parsed.name),
    text: message.text,
    html: message.html,
  });
  if (!sent) return clientError(request, form, 502, SEND_FAILED);
  return clientSuccess(request, form);
}

const NOT_READY = 'This form is not ready to send yet. Please email us or call.';
const SEND_FAILED = 'Sorry, we could not send that. Please email us or call.';
const UNEXPECTED_FIELD = 'That form could not be sent.';
const STAMP_TOO_SOON = 'Please wait a moment and try again.';
const STAMP_INVALID = 'Please reload the page and send the form again.';
const NAME_LINK = 'Please enter your name without a web address.';
const TOO_MANY_LINKS = 'Please include at most a couple of links in your message.';

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

const EMAIL_FONT = 'Arial, Helvetica, sans-serif';

function messageBody(fields: ParsedFields): { text: string; html: string } {
  const phoneLink = telLink(fields.phone);
  const rows: Array<{ label: string; text: string; html: string }> = [
    { label: 'location', text: fields.location.name, html: escapeHtml(fields.location.name) },
    { label: 'name', text: fields.name, html: escapeHtml(fields.name) },
    { label: 'email', text: fields.email, html: mailLink(fields.email) },
    {
      label: 'phone',
      text: fields.phone,
      html: phoneLink ?? (fields.phone ? escapeHtml(fields.phone) : '&nbsp;'),
    },
    { label: 'contact method', text: fields.contactMethod, html: escapeHtml(fields.contactMethod) },
    { label: 'comments', text: fields.comments, html: escapeHtml(fields.comments).replace(/\n/g, '<br>') },
  ];

  const text = ['New form submission', '', ...rows.map((row) => `${row.label}\n${row.text}`)].join('\n\n');
  const blocks = rows
    .map(
      (row) =>
        `<tr><td style="font-family:${EMAIL_FONT};font-size:13px;line-height:1.4;color:#6b7280;padding:0 0 6px 0;">${row.label}</td></tr>` +
        `<tr><td style="font-family:${EMAIL_FONT};font-size:16px;line-height:1.5;color:#111111;padding:0 0 28px 0;">${row.html}</td></tr>`,
    )
    .join('');
  const html =
    '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
    '<tr><td align="left" style="padding:24px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">' +
    `<tr><td style="font-family:${EMAIL_FONT};font-size:28px;line-height:1.2;font-weight:700;color:#333333;padding:0 0 32px 0;">New form submission</td></tr>` +
    blocks +
    '</table></td></tr></table></body></html>';
  return { text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mailLink(email: string): string {
  const safe = escapeHtml(email);
  return `<a href="mailto:${safe}" style="color:#111111;text-decoration:underline;">${safe}</a>`;
}

function telLink(phone: string): string | null {
  const dial = phone.replace(/[^\d+]/g, '');
  if (!/^\+?\d{7,15}$/.test(dial)) return null;
  return `<a href="tel:${dial}" style="color:#111111;text-decoration:underline;">${escapeHtml(phone)}</a>`;
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
  html: string;
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
          html: mail.html,
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

/**
 * Siteverify. A missing secret means the check is not configured: posts with
 * no token still send, and a token we cannot check is rejected. Once the
 * secret is set, every post needs a token. Scripted and no-JS posts are held
 * to the same rule. Errors fail closed.
 */
async function verifyTurnstile(
  request: Request,
  form: FormData,
  env: ContactEnv,
  fetchImpl: typeof fetch,
): Promise<{ ok: boolean }> {
  const secret = turnstileSecret(env);
  const token = textField(form, 'cf-turnstile-response').trim();
  if (token.length > TOKEN_MAX || /[\u0000-\u001F\u007F]/.test(token)) return { ok: false };

  if (!secret) {
    noteMissingTurnstileSecret();
    return { ok: token.length === 0 };
  }

  if (!token) return { ok: false };

  const requestHost = new URL(request.url).hostname.toLowerCase();
  const expected = hostSet(env.TURNSTILE_HOSTNAMES, [...DEFAULT_TURNSTILE_HOSTS, requestHost]);
  if (expected.size === 0) return { ok: false };

  let response: Response;
  try {
    const params = new URLSearchParams({ secret, response: token });
    const ip = clientIp(request);
    if (ip !== 'unknown') params.set('remoteip', ip);
    response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'error';
    console.error(`Turnstile siteverify failed: ${reason}`);
    return { ok: false };
  }

  if (!response.ok) {
    console.error(`Turnstile siteverify failed: HTTP ${response.status}`);
    return { ok: false };
  }

  let result: { success?: boolean; action?: string; hostname?: string } | null = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }
  if (!result || typeof result !== 'object') return { ok: false };

  const hostname = (result.hostname ?? '').toLowerCase();
  return {
    ok: result.success === true && result.action === TURNSTILE_ACTION && expected.has(hostname),
  };
}

function honeypotTripped(form: FormData): boolean {
  return HONEYPOT_FIELDS.some((name) => textField(form, name).length > 0);
}

function hasUnexpectedFields(form: FormData): boolean {
  const seen = new Set<string>();
  for (const [key, value] of form.entries()) {
    if (seen.has(key)) return true;
    seen.add(key);
    if (!ALLOWED_FIELDS.has(key) || typeof value !== 'string') return true;
    if (key === 'page' && value.length > PAGE_MAX) return true;
    if (key === 'form_loaded' && value.length > STAMP_MAX) return true;
  }
  return false;
}

function turnstileSecret(env: ContactEnv): string {
  return (env.TURNSTILE_SECRET ?? '').trim();
}

let warnedMissingSecret = false;

function noteMissingTurnstileSecret(): void {
  if (warnedMissingSecret) return;
  warnedMissingSecret = true;
  console.error(
    'Contact form TURNSTILE_SECRET is unset, so Turnstile and the submit timer are not enforced',
  );
}

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return hex(bytes);
}

function hex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return hex(new Uint8Array(signature));
}

/** Signed `issuedAt.nonce.hmac` for the minimum-time check. Null when Turnstile is not configured. */
export async function issueContactStamp(env: ContactEnv, now = Date.now()): Promise<string | null> {
  const secret = turnstileSecret(env);
  if (!secret) return null;
  const nonce = randomNonce();
  const signature = await hmacHex(secret, `${now}.${nonce}`);
  return `${now}.${nonce}.${signature}`;
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

async function verifyStamp(
  form: FormData,
  env: ContactEnv,
  now: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = turnstileSecret(env);
  if (!secret) return { ok: true };

  const match = /^(\d{10,16})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(textField(form, 'form_loaded').trim());
  if (!match) return { ok: false, error: STAMP_INVALID };
  const issuedAt = Number(match[1]);
  const nonce = match[2] ?? '';
  const signature = match[3] ?? '';
  if (!Number.isSafeInteger(issuedAt)) return { ok: false, error: STAMP_INVALID };

  const expected = await hmacHex(secret, `${issuedAt}.${nonce}`);
  if (!safeEqual(expected, signature)) return { ok: false, error: STAMP_INVALID };

  const age = now - issuedAt;
  if (age < MIN_SUBMIT_MS) return { ok: false, error: STAMP_TOO_SOON };
  if (age > MAX_SUBMIT_MS) return { ok: false, error: STAMP_INVALID };
  return { ok: true };
}

/** `GET /api/contact-stamp`. Issues the signed timer. Uncached. */
export async function handleContactStamp(
  request: Request,
  env: ContactEnv,
  deps: ContactDeps = {},
): Promise<Response> {
  if (request.method !== 'GET') {
    return plain(405, 'Method not allowed', { Allow: 'GET' });
  }
  const originError = checkOrigin(request, env);
  if (originError) return originError;

  const now = deps.now ?? Date.now;
  const stamp = await issueContactStamp(env, now());
  const body = stamp ? { ok: true, required: true, stamp } : { ok: true, required: false };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function spamReason(name: string, comments: string): string | null {
  const nameHasUrl =
    /(?:https?:\/\/|www\.)|\b[a-z0-9-]+\.(?:com|net|org|info|biz|io|xyz|co|shop|online|site)\b/i.test(name);
  if (nameHasUrl) return NAME_LINK;
  const links = comments.match(/https?:\/\/|www\./gi);
  if (links && links.length > MAX_LINKS) return TOO_MANY_LINKS;
  return null;
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
