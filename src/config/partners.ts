/**
 * Community partners published on an office's partners page.
 * Leave this empty until a real partner is ready. An empty list publishes
 * the introduction only: no sample card, no profile page, and no vCard.
 */

export interface Partner {
  slug: string;
  name: string;
  profession: string;
  business?: string;
  summary: string;
  phone?: string;
  email?: string;
  website?: string;
}

export const partners: Partner[] = [];
