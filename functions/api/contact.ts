/**
 * POST /api/contact
 *
 * Sends the contact form through the Email Sending REST API. See
 * src/lib/contact.ts. `wrangler pages dev` serves this file with the built site.
 */

import { handleContact, type ContactEnv } from '../../src/lib/contact';

interface PagesContext {
  request: Request;
  env: ContactEnv;
}

export function onRequest(context: PagesContext): Promise<Response> {
  return handleContact(context.request, context.env);
}
