// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformGetWebhookDelivery = tool({
  description:
    'Gets one webhook delivery attempt by ID — what payload was sent, when, and how your endpoint responded. Use after typeformListWebhookDeliveries to inspect a failed delivery. Needs the webhooks:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID'),
    tag: z.string().min(1).describe('Webhook tag'),
    deliveryId: z.string().min(1).describe('Delivery attempt ID'),
  }),
  execute: async ({ typeformToken, formId, tag, deliveryId }) => {
    if (!formId || !tag || !deliveryId)
      return { error: 'formId, tag and deliveryId are required.' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/webhooks/${encodeURIComponent(tag)}/deliveries/${encodeURIComponent(deliveryId)}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
