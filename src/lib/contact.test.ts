import { afterEach, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { mailForBranch } from '../../functions/api/contact';
import { contactRecipient, handleContact, resetContactLimits, type ContactEnv } from './contact';

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
  expect(mail?.subject).toBe('Message — Celebration (Vitality Family Chiropractic)');
  expect(mail?.text).toContain('office: celebration');
  expect(mail?.text).not.toContain('page:');
  expect(mail?.text).not.toContain('protected health information');
  expect(mail?.text).toContain('name: Jane Doe');
  expect(mail?.text).toContain('email: jane@example.com');
  expect(mail?.text).toContain('phone: (407) 555-0100');
  expect(mail?.text).toContain('contactMethod: Email');
  expect(mail?.text).toContain('Thursday morning works.');
  expect(mail?.text).not.toContain('should-not-leak');
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
  expect(sent[0]?.subject).toBe('Message — College Station (Vitality Family Chiropractic)');
  expect(sent[0]?.text).toContain('office: college-station');
  expect(sent[0]?.text).not.toContain('page:');
  expect(sent[0]?.text).toContain('phone: \n');
});

test('drops a honeypot submission without sending', async () => {
  const sent: unknown[] = [];
  const traps: Array<{ fields: Record<string, string>; ip: string }> = [
    { fields: { _gotcha: 'spam' }, ip: '203.0.113.30' },
    { fields: { botcheck: 'on' }, ip: '203.0.113.31' },
  ];
  for (const trap of traps) {
    const response = await handleContact(
      post({ ...validFields(), ...trap.fields }, { ip: trap.ip }),
      readyEnv(),
      { fetch: mockFetch(sent) },
    );
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/celebration/contact/thanks/');
  }
  expect(sent).toHaveLength(0);
});

test('strips header-injection characters and keeps them out of headers', async () => {
  const sent: Array<Record<string, string>> = [];
  const response = await handleContact(
    post(
      {
        ...validFields(),
        name: 'Ann\r\nBcc: evil@example.com',
        email: 'ann@example.com',
        comments: 'Hello\r\nthere',
      },
      { accept: 'application/json', ip: '203.0.113.40' },
    ),
    readyEnv(),
    { fetch: mockFetch(sent) },
  );

  expect(response.status).toBe(200);
  expect(sent[0]?.subject).toBe('Message — Celebration (Vitality Family Chiropractic)');
  expect(sent[0]?.reply_to).toBe('ann@example.com');
  expect(sent[0]?.subject).not.toMatch(/[\r\n]/);
  expect(sent[0]?.reply_to).not.toMatch(/[\r\n]/);
  expect(sent[0]?.text).toContain('name: Ann Bcc: evil@example.com');
  expect(sent[0]?.text).toContain('Hello\nthere');
  expect(sent[0]?.text).not.toContain('\r');
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

test('requires Turnstile for the scripted path and lets a no-JS post through', async () => {
  const sent: unknown[] = [];
  const env = { ...readyEnv(), TURNSTILE_SECRET: 'turnstile-secret', TURNSTILE_HOSTNAMES: 'www.vitalityfamilychiropractic.com' };
  const fetchImpl = mockFetch(sent, { turnstile: { success: true, action: 'contact', hostname: 'www.vitalityfamilychiropractic.com' } });

  const missing = await handleContact(
    post(validFields(), { accept: 'application/json', ip: '203.0.113.80' }),
    env,
    { fetch: fetchImpl },
  );
  expect(missing.status).toBe(403);
  expect(sent).toHaveLength(0);

  const noJs = await handleContact(post(validFields(), { ip: '203.0.113.81' }), env, { fetch: fetchImpl });
  expect(noJs.status).toBe(303);
  expect(noJs.headers.get('location')).toBe('/celebration/contact/thanks/');
  expect(sent).toHaveLength(1);

  const verified = await handleContact(
    post(
      { ...validFields(), 'cf-turnstile-response': 'token-ok' },
      { accept: 'application/json', ip: '203.0.113.82' },
    ),
    env,
    { fetch: fetchImpl },
  );
  expect(verified.status).toBe(200);
  expect(sent).toHaveLength(2);
});

test('rejects a Turnstile token with the wrong action, hostname, or a failed check', async () => {
  const env = { ...readyEnv(), TURNSTILE_SECRET: 'turnstile-secret' };
  const cases = [
    { success: true, action: 'signup', hostname: 'www.vitalityfamilychiropractic.com' },
    { success: true, action: 'contact', hostname: 'evil.example' },
    { success: false, action: 'contact', hostname: 'www.vitalityfamilychiropractic.com' },
  ];
  for (const [index, turnstile] of cases.entries()) {
    const sent: unknown[] = [];
    const response = await handleContact(
      post(
        { ...validFields(), 'cf-turnstile-response': 'token' },
        { accept: 'application/json', ip: `203.0.113.${90 + index}` },
      ),
      env,
      { fetch: mockFetch(sent, { turnstile }) },
    );
    expect(response.status).toBe(403);
    expect(sent).toHaveLength(0);
  }
});

test('fails closed when siteverify is unreachable', async () => {
  const response = await handleContact(
    post(
      { ...validFields(), 'cf-turnstile-response': 'token' },
      { accept: 'application/json', ip: '203.0.113.100' },
    ),
    { ...readyEnv(), TURNSTILE_SECRET: 'turnstile-secret' },
    {
      fetch: () => Promise.reject(new Error('network')),
    },
  );
  expect(response.status).toBe(403);
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
  const accepted = await handleContact(
    post(
      { ...validFields(), 'cf-turnstile-response': 'token' },
      {
        accept: 'application/json',
        ip: '203.0.113.182',
        url: preview,
        origin: 'https://cursor-native-contact-form-a.vitalityfamilychiro.pages.dev',
      },
    ),
    { ...readyEnv(), TURNSTILE_SECRET: 'turnstile-secret' },
    {
      fetch: mockFetch(sent, {
        turnstile: {
          success: true,
          action: 'contact',
          hostname: 'cursor-native-contact-form-a.vitalityfamilychiro.pages.dev',
        },
      }),
    },
  );
  expect(accepted.status).toBe(200);
  expect(sent).toHaveLength(1);

  const mismatched = await handleContact(
    post(
      { ...validFields(), 'cf-turnstile-response': 'token' },
      {
        accept: 'application/json',
        ip: '203.0.113.183',
        url: preview,
        origin: 'https://cursor-native-contact-form-a.vitalityfamilychiro.pages.dev',
      },
    ),
    { ...readyEnv(), TURNSTILE_SECRET: 'turnstile-secret' },
    {
      fetch: mockFetch([], {
        turnstile: { success: true, action: 'contact', hostname: 'other.pages.dev' },
      }),
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
  expect(form).toContain('name="_gotcha"');
  expect(form).toContain('name="botcheck"');
  expect(form).toContain('Please do not include protected health information');

  const handler = readFileSync('src/lib/contact.ts', 'utf8');
  expect(handler).toContain("url.search = ''");
  expect(handler).toContain('Location: url.pathname');
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
    expect(sent[0]?.subject).toBe('Message — Celebration (Vitality Family Chiropractic)');
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
  options: { turnstile?: { success: boolean; action: string; hostname: string } } = {},
): typeof fetch {
  return (async (input, init) => {
    const url = String(input);
    if (url.includes('siteverify')) {
      const params = new URLSearchParams(String(init?.body ?? ''));
      expect(params.get('secret')).toBe('turnstile-secret');
      expect(params.get('response')).toBeTruthy();
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
