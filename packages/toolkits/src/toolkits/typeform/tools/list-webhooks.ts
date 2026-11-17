// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformListWebhooks = tool({
  description:
    'Lists all webhooks registered on a form — URL, enabled flag, subscribed event types (form_response, form_response_partial), and tag. Use this to find webhook tags before updating or deleting one. Needs the webhooks:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID whose webhooks to list'),
  }),
  execute: async ({ typeformToken, formId }) => {
    if (!formId) return { error: 'formId is required.' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/webhooks`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
