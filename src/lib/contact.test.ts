import { afterEach, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { mailForBranch } from '../../functions/api/contact';
import {
  contactRecipient,
  contactSubject,
  handleContact,
  handleContactStamp,
  issueContactStamp,
  resetContactLimits,
  type ContactEnv,
} from './contact';

const ACCOUNT = 'a'.repeat(32);
const TOKEN = 'test-token';

afterEach(() => {
  resetContactLimits();
});

test('rejects every method except POST', async () => {
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const response = await handleContact(new Request('https://www.vitalityfamilychiropractic.com/api/contact', { method }), {});
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  }
});

test('emails the office and redirects without a query string', async () => {
  const sent: Array<Record<string, unknown>> = [];
  const response = await handleContact(
    post(
      {
        office: 'celebration',
        page: '/celebration/contact/?email=should-not-leak@example.com',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '(407) 555-0100',
        contactMethod: 'Email',
        comments: 'We would like a new-patient visit.\nThursday morning works.',
      },
      { url: 'https://www.vitalityfamilychiropractic.com/api/contact?email=jane@example.com&comments=secret' },
    ),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );

  expect(response.status).toBe(303);
  expect(response.headers.get('location')).toBe('/celebration/contact/thanks/');
  expect(response.headers.get('location')).not.toContain('?');
  expect(response.headers.get('location')).not.toContain('jane');
  expect(await response.text()).toBe('');

  expect(sent).toHaveLength(1);
  const mail = sent[0];
  expect(mail?.to).toEqual(['info@vitalityfamilychiropractic.com']);
  expect(mail?.from).toEqual({
    address: 'website@vitalityfamilychiropractic.com',
    name: 'Vitality Family Chiropractic website',
  });
  expect(mail?.reply_to).toBe('jane@example.com');
  expect(mail?.subject).toBe('Message - Celebration (Jane Doe)');
  expect(mail?.text).toContain('New form submission');
  expect(mail?.text).toContain('location\nCelebration');
  expect(mail?.text).not.toContain('page:');
  expect(mail?.text).not.toContain('protected health information');
  expect(mail?.text).toContain('name\nJane Doe');
  expect(mail?.text).toContain('email\njane@example.com');
  expect(mail?.text).toContain('phone\n(407) 555-0100');
  expect(mail?.text).toContain('contact method\nEmail');
  expect(mail?.text).toContain('Thursday morning works.');
  expect(mail?.text).not.toContain('should-not-leak');
  expect(mail?.html).toContain('New form submission');
  expect(mail?.html).toContain('>location<');
  expect(mail?.html).toContain('Celebration');
  expect(mail?.html).toContain('href="mailto:jane@example.com"');
  expect(mail?.html).toContain('href="tel:4075550100"');
  expect(mail).not.toHaveProperty('bcc');
  expect(JSON.stringify(mail)).not.toContain('?');
});

test('names the College Station page in the JSON success path', async () => {
  const sent: Array<Record<string, unknown>> = [];
  const response = await handleContact(
    post(
      {
        office: 'college-station',
        name: 'Alex Kim',
        email: 'alex@example.com',
        phone: '',
        contactMethod: 'Phone call',
        comments: 'Looking for a Saturday visit.',
      },
      { accept: 'application/json', ip: '203.0.113.20' },
    ),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  expect(sent[0]?.subject).toBe('Message - College Station (Alex Kim)');
  expect(sent[0]?.text).toContain('location\nCollege Station');
  expect(sent[0]?.text).not.toContain('college-station');
  expect(sent[0]?.text).not.toContain('page:');
  expect(sent[0]?.text).toContain('phone\n\n');
  expect(sent[0]?.html).toContain('>phone<');
  expect(sent[0]?.html).not.toContain('tel:');
});

test('sends an HTML body with escaped values and the plain-text fields', async () => {
  const sent: Array<Record<string, unknown>> = [];
  const response = await handleContact(
    post(
      {
        ...validFields(),
        name: 'Jane & "Jo" <admin>',
        comments: 'First line\n<script>alert(1)</script>\nThird',
        phone: '',
        page: '/celebration/contact/',
      },
      { accept: 'application/json', ip: '203.0.113.190' },
    ),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );
  expect(response.status).toBe(200);
  const html = String(sent[0]?.html);
  const text = String(sent[0]?.text);
  expect(html).toContain('New form submission');
  expect(html).not.toContain('Someone just submitted');
  expect(html).toContain('Jane &amp; &quot;Jo&quot; &lt;admin&gt;');
  expect(html).toContain('First line<br>&lt;script&gt;alert(1)&lt;/script&gt;<br>Third');
  expect(html).not.toContain('<script>');
  expect(html).not.toContain('from_name');
  expect(html).not.toContain('botcheck');
  expect(html).not.toContain('_gotcha');
  expect(html).not.toContain('/celebration/contact/');
  expect(html).not.toContain('protected health information');
  expect(html.indexOf('>location<')).toBeLessThan(html.indexOf('>name<'));
  expect(html.indexOf('>name<')).toBeLessThan(html.indexOf('>email<'));
  expect(html.indexOf('>email<')).toBeLessThan(html.indexOf('>phone<'));
  expect(html.indexOf('>phone<')).toBeLessThan(html.indexOf('>contact method<'));
  expect(html.indexOf('>contact method<')).toBeLessThan(html.indexOf('>comments<'));
  expect(text).toContain('First line\n<script>alert(1)</script>\nThird');
  expect(text).not.toContain('from_name');
  expect(text).not.toContain('botcheck');
  expect(sent[0]?.subject).toBe('Message - Celebration (Jane & "Jo" <admin>)');
  expect(sent[0]?.subject).not.toMatch(/[—\r\n]/);
});

test('builds a header-safe subject from the office and the visitor name', () => {
  expect(contactSubject('College Station', 'Jane Doe')).toBe('Message - College Station (Jane Doe)');
  expect(contactSubject('College Station', '  Jane\r\nDoe\u0000  ')).toBe('Message - College Station (Jane Doe)');
  expect(contactSubject('Celebration', 'A'.repeat(150))).toBe(`Message - Celebration (${'A'.repeat(100)})`);
  expect(contactSubject('College Station', 'Jane Doe')).not.toContain('—');
});

test('drops a honeypot submission without sending', async () => {
  const sent: unknown[] = [];
  const traps: Array<{ fields: Record<string, string>; ip: string; accept?: string }> = [
    { fields: { vfc_hp_field: 'https://spam.example' }, ip: '203.0.113.30' },
    { fields: { vfc_hp_field: '   ' }, ip: '203.0.113.32' },
    { fields: { _gotcha: 'spam' }, ip: '203.0.113.33' },
    { fields: { botcheck: 'on' }, ip: '203.0.113.31' },
    { fields: { vfc_hp_field: 'filled' }, ip: '203.0.113.34', accept: 'application/json' },
  ];
  for (const trap of traps) {
    const response = await handleContact(
      post({ ...validFields(), ...trap.fields }, { ip: trap.ip, accept: trap.accept }),
      readyEnv(),
      { fetch: mockFetch(sent) },
    );
    if (trap.accept === 'application/json') {
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
    } else {
      expect(response.status).toBe(303);
      expect(response.headers.get('location')).toBe('/celebration/contact/thanks/');
    }
  }
  expect(sent).toHaveLength(0);
});

test('rejects an unexpected or repeated field', async () => {
  const cases = [
    { ...validFields(), from_name: 'Vitality Family Chiropractic website' },
    { ...validFields(), website: 'https://spam.example' },
    { ...validFields(), extra: '' },
  ];
  for (const [index, fields] of cases.entries()) {
    const sent: unknown[] = [];
    const response = await handleContact(
      post(fields, { accept: 'application/json', ip: `203.0.113.${21 + index}` }),
      readyEnv(),
      { fetch: mockFetch(sent) },
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: 'That form could not be sent.' });
    expect(sent).toHaveLength(0);
  }

  const body = new URLSearchParams(validFields());
  body.append('name', 'Second Name');
  const sent: unknown[] = [];
  const duplicate = await handleContact(
    new Request('https://www.vitalityfamilychiropractic.com/api/contact', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
        origin: 'https://www.vitalityfamilychiropractic.com',
        'cf-connecting-ip': '203.0.113.29',
      },
      body,
    }),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );
  expect(duplicate.status).toBe(400);
  expect(sent).toHaveLength(0);

  const cached = await handleContact(
    post(
      { ...validFields(), _gotcha: '', botcheck: '' },
      { accept: 'application/json', ip: '203.0.113.28' },
    ),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );
  expect(cached.status).toBe(200);
  expect(sent).toHaveLength(1);
});

test('rejects a web address in the name and a message with too many links', async () => {
  const cases = [
    { ...validFields(), name: 'https://spam.example' },
    { ...validFields(), name: 'www.spam.example' },
    { ...validFields(), name: 'Jane example.com' },
    {
      ...validFields(),
      comments: 'See https://a.example and https://b.example and www.c.example',
    },
  ];
  for (const [index, fields] of cases.entries()) {
    const sent: unknown[] = [];
    const response = await handleContact(
      post(fields, { accept: 'application/json', ip: `198.51.100.${index + 1}` }),
      readyEnv(),
      { fetch: mockFetch(sent) },
    );
    expect(response.status).toBe(400);
    expect(sent).toHaveLength(0);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(JSON.stringify(body)).not.toContain('spam.example');
  }

  const sent: unknown[] = [];
  const allowed = await handleContact(
    post(
      {
        ...validFields(),
        name: "Dr. Mary-Jane O'Neil",
        comments: 'Found you on google.com. Thursday works.\nhttps://maps.example/place and www.example.com/hours',
      },
      { accept: 'application/json', ip: '198.51.100.20' },
    ),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );
  expect(allowed.status).toBe(200);
  expect(sent).toHaveLength(1);
  expect(sent[0]).toMatchObject({ reply_to: 'jane@example.com' });
});

test('strips header-injection characters and keeps them out of headers', async () => {
  const sent: Array<Record<string, string>> = [];
  const response = await handleContact(
    post(
      {
        ...validFields(),
        name: 'Ann\r\nBcc: someone',
        email: 'ann@example.com',
        comments: 'Hello\r\nthere',
      },
      { accept: 'application/json', ip: '203.0.113.40' },
    ),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );

  expect(response.status).toBe(200);
  expect(sent[0]?.subject).toBe('Message - Celebration (Ann Bcc: someone)');
  expect(sent[0]?.reply_to).toBe('ann@example.com');
  expect(sent[0]?.subject).not.toMatch(/[\r\n]/);
  expect(sent[0]?.reply_to).not.toMatch(/[\r\n]/);
  expect(sent[0]?.text).toContain('Ann Bcc: someone');
  expect(sent[0]?.text).toContain('Hello\nthere');
  expect(sent[0]?.text).not.toContain('\r');
  expect(sent[0]?.html).toContain('Hello<br>there');
  expect(sent[0]?.html).not.toContain('\r');
});

test('rejects an email that tries to add a header', async () => {
  const sent: unknown[] = [];
  const response = await handleContact(
    post(
      { ...validFields(), email: 'jane@example.com\r\nBcc: evil@example.com' },
      { accept: 'application/json', ip: '203.0.113.41' },
    ),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ ok: false, error: 'Please enter a valid email address.' });
  expect(sent).toHaveLength(0);
});

test('validates required fields, length, phone, and office', async () => {
  const cases: Array<{ fields: Record<string, string>; error: string }> = [
    { fields: { ...validFields(), name: '   ' }, error: 'Name is required.' },
    { fields: { ...validFields(), email: 'not-an-email' }, error: 'Please enter a valid email address.' },
    { fields: { ...validFields(), comments: '' }, error: 'A message is required.' },
    { fields: { ...validFields(), comments: 'x'.repeat(4001) }, error: 'Message is too long.' },
    { fields: { ...validFields(), name: 'x'.repeat(101) }, error: 'Name is too long.' },
    { fields: { ...validFields(), phone: 'call me maybe' }, error: 'Please check the phone number.' },
    { fields: { ...validFields(), contactMethod: 'Carrier pigeon' }, error: 'Please choose a contact method.' },
    { fields: { ...validFields(), office: 'not-an-office' }, error: 'Please choose an office and try again.' },
  ];

  for (const [index, item] of cases.entries()) {
    const response = await handleContact(
      post(item.fields, { accept: 'application/json', ip: `203.0.113.${50 + index}` }),
      readyEnv(),
      { fetch: mockFetch([]) },
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ ok: false, error: item.error });
    expect(JSON.stringify(body)).not.toContain('Carrier pigeon');
    expect(JSON.stringify(body)).not.toContain('not-an-office');
  }
});

test('sends a no-JS validation failure to the error page with no query', async () => {
  const response = await handleContact(
    post({ ...validFields(), email: 'nope', name: 'Secret Name' }, { ip: '203.0.113.70' }),
    readyEnv(),
  );
  expect(response.status).toBe(303);
  expect(response.headers.get('location')).toBe('/celebration/contact/error/');
  expect(response.headers.get('location')).not.toContain('?');
  expect(response.headers.get('location')).not.toContain('Secret');
});

test('does not redirect an unknown office to a path built from the field', async () => {
  const response = await handleContact(
    post({ ...validFields(), office: 'celebration/thanks/?email=jane@example.com' }, { ip: '203.0.113.71' }),
    readyEnv(),
  );
  expect(response.status).toBe(400);
  expect(response.headers.get('location')).toBeNull();
  expect(await response.text()).not.toContain('jane');
});

test('requires a Turnstile token on every post once the secret is set', async () => {
  const sent: unknown[] = [];
  const env = turnstileEnv({ TURNSTILE_HOSTNAMES: 'www.vitalityfamilychiropractic.com' });
  const now = 1_700_000_000_000;
  const fetchImpl = mockFetch(sent, {
    turnstile: { success: true, action: 'contact', hostname: 'www.vitalityfamilychiropractic.com' },
  });

  const missing = await handleContact(
    post(await agedFields(validFields(), env, now), { accept: 'application/json', ip: '203.0.113.80' }),
    env,
    { fetch: fetchImpl, now: () => now },
  );
  expect(missing.status).toBe(403);
  expect(sent).toHaveLength(0);

  const noJs = await handleContact(
    post(await agedFields(validFields(), env, now), { ip: '203.0.113.81' }),
    env,
    { fetch: fetchImpl, now: () => now },
  );
  expect(noJs.status).toBe(303);
  expect(noJs.headers.get('location')).toBe('/celebration/contact/error/');
  expect(sent).toHaveLength(0);

  const unconfigured = await handleContact(
    post(validFields(), { accept: 'application/json', ip: '203.0.113.84' }),
    readyEnv(),
    { fetch: mockFetch([]) },
  );
  expect(unconfigured.status).toBe(200);

  const tokenWithoutSecret = await handleContact(
    post(
      { ...validFields(), 'cf-turnstile-response': 'token-unchecked' },
      { accept: 'application/json', ip: '203.0.113.85' },
    ),
    readyEnv(),
    { fetch: mockFetch([]) },
  );
  expect(tokenWithoutSecret.status).toBe(403);

  const tooSoon = await handleContact(
    post(await agedFields(validFields(), env, now, 500), { accept: 'application/json', ip: '203.0.113.86' }),
    env,
    { fetch: fetchImpl, now: () => now },
  );
  expect(tooSoon.status).toBe(400);
  expect(await tooSoon.json()).toEqual({ ok: false, error: 'Please wait a moment and try again.' });
  expect(sent).toHaveLength(0);

  const verified = await handleContact(
    post(
      await agedFields({ ...validFields(), 'cf-turnstile-response': 'token-ok' }, env, now),
      { accept: 'application/json', ip: '203.0.113.82' },
    ),
    env,
    { fetch: fetchImpl, now: () => now },
  );
  expect(verified.status).toBe(200);
  expect(sent).toHaveLength(1);
});

test('rejects a Turnstile token with the wrong action, hostname, or a failed check', async () => {
  const env = turnstileEnv();
  const cases: Array<{ success?: boolean; action?: string; hostname?: string }> = [
    { success: true, action: 'signup', hostname: 'www.vitalityfamilychiropractic.com' },
    { success: true, action: 'contact', hostname: 'evil.example' },
    { success: false, action: 'contact', hostname: 'www.vitalityfamilychiropractic.com' },
    { success: true, hostname: 'www.vitalityfamilychiropractic.com' },
    { success: true, action: 'contact' },
  ];
  for (const [index, turnstile] of cases.entries()) {
    const sent: unknown[] = [];
    const now = 1_700_000_100_000 + index;
    const response = await handleContact(
      post(
        await agedFields({ ...validFields(), 'cf-turnstile-response': 'token' }, env, now),
        { accept: 'application/json', ip: `203.0.113.${90 + index}` },
      ),
      env,
      { fetch: mockFetch(sent, { turnstile }), now: () => now },
    );
    expect(response.status).toBe(403);
    expect(sent).toHaveLength(0);
  }
});

test('fails closed when siteverify errors', async () => {
  const env = turnstileEnv();
  const now = 1_700_000_200_000;
  const fields = await agedFields({ ...validFields(), 'cf-turnstile-response': 'token' }, env, now);
  const unreachable = await handleContact(
    post(fields, { accept: 'application/json', ip: '203.0.113.100' }),
    env,
    { fetch: () => Promise.reject(new Error('network')), now: () => now },
  );
  expect(unreachable.status).toBe(403);

  const httpError = await handleContact(
    post(fields, { accept: 'application/json', ip: '203.0.113.101' }),
    env,
    {
      fetch: () => Promise.resolve(new Response('nope', { status: 500 })),
      now: () => now,
    },
  );
  expect(httpError.status).toBe(403);

  const badJson = await handleContact(
    post(fields, { accept: 'application/json', ip: '203.0.113.102' }),
    env,
    {
      fetch: () => Promise.resolve(new Response('not-json', { status: 200 })),
      now: () => now,
    },
  );
  expect(badJson.status).toBe(403);
});

test('rejects a stamp that is missing, altered, or too old', async () => {
  const env = turnstileEnv();
  const now = 1_700_000_300_000;
  const token = { ...validFields(), 'cf-turnstile-response': 'token' };
  const missing = await handleContact(
    post(token, { accept: 'application/json', ip: '203.0.113.111' }),
    env,
    { fetch: mockFetch([]), now: () => now },
  );
  expect(missing.status).toBe(400);
  expect(await missing.json()).toEqual({
    ok: false,
    error: 'Please reload the page and send the form again.',
  });

  const stamp = await issueContactStamp(env, now - 5_000);
  expect(stamp).toBeTruthy();
  const flipped = `${stamp!.slice(0, -1)}${stamp!.endsWith('a') ? 'b' : 'a'}`;
  const altered = await handleContact(
    post({ ...token, form_loaded: flipped }, { accept: 'application/json', ip: '203.0.113.112' }),
    env,
    { fetch: mockFetch([]), now: () => now },
  );
  expect(altered.status).toBe(400);

  const expired = await handleContact(
    post(
      await agedFields(token, env, now, 12 * 60 * 60 * 1000 + 1),
      { accept: 'application/json', ip: '203.0.113.113' },
    ),
    env,
    { fetch: mockFetch([]), now: () => now },
  );
  expect(expired.status).toBe(400);
  expect(await expired.json()).toEqual({
    ok: false,
    error: 'Please reload the page and send the form again.',
  });
});

test('issues a stamp the contact handler will accept after the minimum wait', async () => {
  const env = turnstileEnv();
  const now = 1_700_000_400_000;
  const issued = await handleContactStamp(
    new Request('https://www.vitalityfamilychiropractic.com/api/contact-stamp', {
      headers: { accept: 'application/json', origin: 'https://www.vitalityfamilychiropractic.com' },
    }),
    env,
    { now: () => now - 5_000 },
  );
  expect(issued.status).toBe(200);
  expect(issued.headers.get('cache-control')).toBe('no-store');
  const body = (await issued.json()) as { ok: boolean; required: boolean; stamp: string };
  expect(body.ok).toBe(true);
  expect(body.required).toBe(true);
  expect(body.stamp).not.toContain('turnstile-secret');

  const sent: unknown[] = [];
  const accepted = await handleContact(
    post(
      { ...validFields(), 'cf-turnstile-response': 'token', form_loaded: body.stamp },
      { accept: 'application/json', ip: '203.0.113.120' },
    ),
    env,
    {
      fetch: mockFetch(sent, {
        turnstile: { success: true, action: 'contact', hostname: 'www.vitalityfamilychiropractic.com' },
      }),
      now: () => now,
    },
  );
  expect(accepted.status).toBe(200);
  expect(sent).toHaveLength(1);

  const open = await handleContactStamp(
    new Request('https://www.vitalityfamilychiropractic.com/api/contact-stamp'),
    readyEnv(),
  );
  expect(await open.json()).toEqual({ ok: true, required: false });

  const denied = await handleContactStamp(
    new Request('https://www.vitalityfamilychiropractic.com/api/contact-stamp', {
      method: 'POST',
    }),
    env,
  );
  expect(denied.status).toBe(405);

  const foreign = await handleContactStamp(
    new Request('https://preview.example.pages.dev/api/contact-stamp', {
      headers: { accept: 'application/json', origin: 'https://evil.example' },
    }),
    env,
  );
  expect(foreign.status).toBe(403);
});

test('rate limits an address after five posts', async () => {
  const sent: unknown[] = [];
  const fetchImpl = mockFetch(sent);
  const env = readyEnv();
  for (let i = 0; i < 5; i += 1) {
    const response = await handleContact(post(validFields(), { accept: 'application/json', ip: '198.51.100.8' }), env, {
      fetch: fetchImpl,
    });
    expect(response.status).toBe(200);
  }
  const blocked = await handleContact(post(validFields(), { accept: 'application/json', ip: '198.51.100.8' }), env, {
    fetch: fetchImpl,
  });
  expect(blocked.status).toBe(429);
  expect(sent).toHaveLength(5);
});

test('reports a missing email configuration without sending', async () => {
  const sent: unknown[] = [];
  const response = await handleContact(
    post(validFields(), { accept: 'application/json', ip: '203.0.113.110' }),
    {},
    { fetch: mockFetch(sent) },
  );
  expect(response.status).toBe(503);
  const body = await response.json();
  expect(body).toEqual({ ok: false, error: 'This form is not ready to send yet. Please email us or call.' });
  expect(JSON.stringify(body)).not.toContain('jane');
  expect(sent).toHaveLength(0);
});

test('uses CONTACT_FROM when it is on the practice domain', async () => {
  const sent: Array<Record<string, unknown>> = [];
  const response = await handleContact(
    post(validFields(), { accept: 'application/json', ip: '203.0.113.120' }),
    { ...readyEnv(), CONTACT_FROM: 'forms@vitalityfamilychiropractic.com' },
    { fetch: mockFetch(sent) },
  );
  expect(response.status).toBe(200);
  expect(sent[0]?.from).toEqual({
    address: 'forms@vitalityfamilychiropractic.com',
    name: 'Vitality Family Chiropractic website',
  });
});

test('refuses a sender address outside the practice domain', async () => {
  const sent: unknown[] = [];
  const response = await handleContact(
    post(validFields(), { accept: 'application/json', ip: '203.0.113.121' }),
    { ...readyEnv(), CONTACT_FROM: 'attacker@example.com' },
    { fetch: mockFetch(sent) },
  );
  expect(response.status).toBe(503);
  expect(sent).toHaveLength(0);
});

test('turns an email API failure into an error the page can show', async () => {
  const response = await handleContact(
    post(validFields(), { accept: 'application/json', ip: '203.0.113.130' }),
    readyEnv(),
    {
      fetch: () =>
        Promise.resolve(
          new Response(JSON.stringify({ success: false, errors: [{ code: 10208, message: 'plan' }] }), {
            status: 403,
            headers: { 'content-type': 'application/json' },
          }),
        ),
    },
  );
  expect(response.status).toBe(502);
  const body = await response.json();
  expect(body).toEqual({ ok: false, error: 'Sorry, we could not send that. Please email us or call.' });
  expect(JSON.stringify(body)).not.toContain('10208');
});

test('rejects an oversized body without copying it into a URL', async () => {
  const response = await handleContact(
    post(
      { ...validFields(), comments: 'x'.repeat(BODY_TOO_BIG) },
      { accept: 'application/json', ip: '203.0.113.150' },
    ),
    readyEnv(),
  );
  expect(response.status).toBe(413);
  expect(response.headers.get('location')).toBeNull();
  expect(await response.text()).not.toContain('x'.repeat(20));
});

test('allows a same-origin preview host and still rejects a cross-site origin', async () => {
  const preview = 'https://cursor-native-contact-form-a.vitalityfamilychiro.pages.dev/api/contact';
  const sent: unknown[] = [];
  const sameOrigin = await handleContact(
    post(validFields(), {
      accept: 'application/json',
      ip: '203.0.113.180',
      url: preview,
      origin: 'https://cursor-native-contact-form-a.vitalityfamilychiro.pages.dev',
    }),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );
  expect(sameOrigin.status).toBe(200);
  expect(sent).toHaveLength(1);

  const crossSite = await handleContact(
    post(validFields(), {
      accept: 'application/json',
      ip: '203.0.113.181',
      url: preview,
      origin: 'https://evil.example',
    }),
    readyEnv(),
  );
  expect(crossSite.status).toBe(403);
  expect(await crossSite.json()).toEqual({
    ok: false,
    error: 'This form only accepts messages from the practice website.',
  });
});

test('accepts a Turnstile hostname that matches the request host', async () => {
  const preview = 'https://cursor-native-contact-form-a.vitalityfamilychiro.pages.dev/api/contact';
  const sent: unknown[] = [];
  const env = turnstileEnv();
  const now = 1_700_000_500_000;
  const accepted = await handleContact(
    post(
      await agedFields({ ...validFields(), 'cf-turnstile-response': 'token' }, env, now),
      {
        accept: 'application/json',
        ip: '203.0.113.182',
        url: preview,
        origin: 'https://cursor-native-contact-form-a.vitalityfamilychiro.pages.dev',
      },
    ),
    env,
    {
      fetch: mockFetch(sent, {
        turnstile: {
          success: true,
          action: 'contact',
          hostname: 'cursor-native-contact-form-a.vitalityfamilychiro.pages.dev',
        },
      }),
      now: () => now,
    },
  );
  expect(accepted.status).toBe(200);
  expect(sent).toHaveLength(1);

  const mismatched = await handleContact(
    post(
      await agedFields({ ...validFields(), 'cf-turnstile-response': 'token' }, env, now),
      {
        accept: 'application/json',
        ip: '203.0.113.183',
        url: preview,
        origin: 'https://cursor-native-contact-form-a.vitalityfamilychiro.pages.dev',
      },
    ),
    env,
    {
      fetch: mockFetch([], {
        turnstile: { success: true, action: 'contact', hostname: 'other.pages.dev' },
      }),
      now: () => now,
    },
  );
  expect(mismatched.status).toBe(403);
});

test('rejects a cross-site origin and a non-form body', async () => {
  const foreign = await handleContact(
    post(validFields(), { origin: 'https://evil.example', ip: '203.0.113.140' }),
    readyEnv(),
  );
  expect(foreign.status).toBe(403);
  expect(foreign.headers.get('location')).toBeNull();

  const jsonBody = await handleContact(
    new Request('https://www.vitalityfamilychiropractic.com/api/contact', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        origin: 'https://www.vitalityfamilychiropractic.com',
      },
      body: JSON.stringify(validFields()),
    }),
    readyEnv(),
  );
  expect(jsonBody.status).toBe(415);
});

test('form sources do not send field values to a URL or to analytics', () => {
  const files = [
    'src/components/ContactForm.astro',
    'src/lib/contact.ts',
    'src/pages/[location]/contact/thanks.astro',
    'src/pages/[location]/contact/error.astro',
    'functions/api/contact.ts',
    'functions/api/contact-stamp.ts',
  ];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    expect(source).not.toMatch(/formspree/i);
    expect(source).not.toMatch(/gtag\s*\(|dataLayer/);
    expect(source).not.toMatch(/method=["']GET["']/i);
    expect(source).not.toMatch(/action=["'][^"']*\?/);
  }

  for (const file of files.filter((item) => item.endsWith('.astro'))) {
    const source = readFileSync(file, 'utf8');
    expect(source).not.toMatch(/URLSearchParams|location\.search|location\.href|history\.pushState/);
  }

  const form = readFileSync('src/components/ContactForm.astro', 'utf8');
  expect(form).toContain('action="/api/contact"');
  expect(form).toContain('method="POST"');
  expect(form).toContain('name="vfc_hp_field"');
  expect(form).toContain('tabindex="-1"');
  expect(form).toContain('autocomplete="off"');
  expect(form).toContain('aria-hidden="true"');
  expect(form).toContain('left:-9999px');
  expect(form).not.toContain('name="_gotcha"');
  expect(form).not.toContain('name="botcheck"');
  expect(form).not.toContain('type="hidden" name="vfc_hp_field"');
  expect(form).toContain('Please do not include protected health information');

  const handler = readFileSync('src/lib/contact.ts', 'utf8');
  expect(handler).toContain("url.search = ''");
  expect(handler).toContain('Location: url.pathname');
  expect(handler).toContain('vfc_hp_field');
  expect(handler).toContain('_gotcha');
  expect(handler).toContain('siteverify');
});

const BODY_TOO_BIG = 32 * 1024 + 1;

test('sends main to the office inbox and every other branch to the preview inbox', async () => {
  expect(contactRecipient('main')).toBe('info@vitalityfamilychiropractic.com');
  expect(contactRecipient(undefined)).toBe('nick@vitalityfamilychiropractic.com');
  expect(contactRecipient('')).toBe('nick@vitalityfamilychiropractic.com');
  expect(contactRecipient('cursor/native-contact-form-a46d')).toBe('nick@vitalityfamilychiropractic.com');

  const branches: Array<string | undefined> = [undefined, '', 'cursor/native-contact-form-a46d'];
  for (const [index, branch] of branches.entries()) {
    const sent: Array<Record<string, unknown>> = [];
    const env: ContactEnv = { CLOUDFLARE_ACCOUNT_ID: ACCOUNT, EMAIL_API_TOKEN: TOKEN };
    if (branch !== undefined) env.CF_PAGES_BRANCH = branch;
    const response = await handleContact(
      post(validFields(), { accept: 'application/json', ip: `203.0.113.${160 + index}` }),
      env,
      { fetch: mockFetch(sent) },
    );
    expect(response.status).toBe(200);
    expect(sent[0]?.to).toEqual(['nick@vitalityfamilychiropractic.com']);
    expect(sent[0]?.subject).toBe('Message - Celebration (Jane Doe)');
    expect(JSON.stringify(sent[0])).not.toContain('jane@example.com?');
  }

  const previewMail = mailForBranch('cursor/native-contact-form-a46d');
  const productionMail = mailForBranch('main');
  expect(previewMail).toEqual({
    to: 'nick@vitalityfamilychiropractic.com',
    fromName: 'Vitality Family Chiropractic website',
    fromEmail: 'website@vitalityfamilychiropractic.com',
  });
  expect(productionMail.to).toBe('info@vitalityfamilychiropractic.com');

  const sent: Array<Record<string, unknown>> = [];
  const wired = await handleContact(
    post(validFields(), { accept: 'application/json', ip: '203.0.113.171' }),
    { ...readyEnv(), CF_PAGES_BRANCH: 'cursor/native-contact-form-a46d' },
    { fetch: mockFetch(sent), ...previewMail },
  );
  expect(wired.status).toBe(200);
  expect(sent[0]?.to).toEqual(['nick@vitalityfamilychiropractic.com']);
  expect(sent[0]?.from).toEqual({
    address: previewMail.fromEmail,
    name: previewMail.fromName,
  });
});

function readyEnv(): ContactEnv {
  return { CLOUDFLARE_ACCOUNT_ID: ACCOUNT, EMAIL_API_TOKEN: TOKEN, CF_PAGES_BRANCH: 'main' };
}

function turnstileEnv(extra: ContactEnv = {}): ContactEnv {
  return { ...readyEnv(), TURNSTILE_SECRET: 'turnstile-secret', ...extra };
}

async function agedFields(
  fields: Record<string, string>,
  env: ContactEnv,
  now: number,
  age = 5_000,
): Promise<Record<string, string>> {
  const stamp = await issueContactStamp(env, now - age);
  return stamp ? { ...fields, form_loaded: stamp } : fields;
}

function validFields(): Record<string, string> {
  return {
    office: 'celebration',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '407-555-0100',
    contactMethod: 'Email',
    comments: 'Hello from the form.',
  };
}

function post(
  fields: Record<string, string>,
  options: { accept?: string; origin?: string; ip?: string; url?: string } = {},
): Request {
  const body = new URLSearchParams(fields);
  return new Request(options.url ?? 'https://www.vitalityfamilychiropractic.com/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: options.accept ?? 'text/html',
      origin: options.origin ?? 'https://www.vitalityfamilychiropractic.com',
      'cf-connecting-ip': options.ip ?? '203.0.113.10',
    },
    body,
  });
}

function mockFetch(
  sent: unknown[],
  options: { turnstile?: { success?: boolean; action?: string; hostname?: string } } = {},
): typeof fetch {
  return (async (input, init) => {
    const url = String(input);
    if (url.includes('siteverify')) {
      const params = new URLSearchParams(String(init?.body ?? ''));
      expect(params.get('secret')).toBe('turnstile-secret');
      expect(params.get('response')).toBeTruthy();
      expect(params.get('remoteip')).toMatch(/^\d{1,3}(?:\.\d{1,3}){3}$/);
      return new Response(JSON.stringify(options.turnstile));
    }
    expect(url).toBe(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/email/sending/send`);
    expect(new Headers(init?.headers).get('authorization')).toBe(`Bearer ${TOKEN}`);
    const mail = JSON.parse(String(init?.body)) as Record<string, unknown>;
    sent.push(mail);
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          message_id: '<test@vitalityfamilychiropractic.com>',
          delivered: ['info@vitalityfamilychiropractic.com'],
          permanent_bounces: [],
          queued: [],
        },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }) as typeof fetch;
}
