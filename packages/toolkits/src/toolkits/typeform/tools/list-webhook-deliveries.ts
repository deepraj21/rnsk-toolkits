// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformListWebhookDeliveries = tool({
  description:
    'Lists recent delivery attempts for a form’s webhook — payload status and response codes from your endpoint. Use this to debug why submissions are not arriving. Needs the webhooks:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID'),
    tag: z.string().min(1).describe('Webhook tag whose deliveries to list'),
  }),
  execute: async ({ typeformToken, formId, tag }) => {
    if (!formId || !tag) return { error: 'formId and tag are required.' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/webhooks/${encodeURIComponent(tag)}/deliveries`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
