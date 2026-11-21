import { expect, test } from 'bun:test';
import { showOffNav } from '../config/site';

test('shows turned-off nav on the dev server and on non-production Cloudflare branches', () => {
  expect(showOffNav(true, undefined)).toBe(true);
  expect(showOffNav(true, 'main')).toBe(true);
  expect(showOffNav(false, 'cursor/native-contact-form-a46d')).toBe(true);
  expect(showOffNav(false, 'preview')).toBe(true);
  expect(showOffNav(false, 'main')).toBe(false);
  expect(showOffNav(false, undefined)).toBe(false);
  expect(showOffNav(false, '')).toBe(false);
});
