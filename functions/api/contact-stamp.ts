/**
 * GET /api/contact-stamp
 *
 * Issues the signed time the contact form must wait before it will send.
 * The page fetches this when it loads. Nothing here sends mail.
 */

import { handleContactStamp, type ContactEnv } from '../../src/lib/contact';

interface PagesContext {
  request: Request;
  env: ContactEnv;
}

export function onRequest(context: PagesContext): Promise<Response> {
  return handleContactStamp(context.request, context.env);
}
