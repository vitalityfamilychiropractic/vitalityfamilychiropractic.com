/**
 * POST /api/contact
 *
 * Sends the contact form through the Email Sending REST API. Addresses and
 * the From name live in src/config/site.ts. `wrangler pages dev` serves this
 * file with the built site.
 */

import {
  CONTACT_TO,
  DEFAULT_CONTACT_FROM_EMAIL,
  DEFAULT_CONTACT_FROM_NAME,
  PREVIEW_CONTACT_TO,
} from '../../src/config/site';
import { contactRecipient, handleContact, type ContactEnv } from '../../src/lib/contact';

interface PagesContext {
  request: Request;
  env: ContactEnv;
}

/** Addresses for this Pages branch. Production is `main`; every other branch is the preview inbox. */
export function mailForBranch(branch: string | undefined): {
  to: string;
  fromName: string;
  fromEmail: string;
} {
  return {
    to: contactRecipient(branch, CONTACT_TO, PREVIEW_CONTACT_TO),
    fromName: DEFAULT_CONTACT_FROM_NAME,
    fromEmail: DEFAULT_CONTACT_FROM_EMAIL,
  };
}

export function onRequest(context: PagesContext): Promise<Response> {
  return handleContact(context.request, context.env, mailForBranch(context.env.CF_PAGES_BRANCH));
}
