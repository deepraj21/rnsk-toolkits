// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformGetWebhook = tool({
  description:
    'Gets one webhook on a form by its tag — URL, enabled state, event types, secret, SSL verification, and created/updated timestamps. Needs the webhooks:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID'),
    tag: z.string().min(1).describe('Webhook tag (its unique name on the form)'),
  }),
  execute: async ({ typeformToken, formId, tag }) => {
    if (!formId || !tag) return { error: 'formId and tag are required.' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/webhooks/${encodeURIComponent(tag)}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
