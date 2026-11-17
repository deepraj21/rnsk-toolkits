// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformDeleteWebhook = tool({
  description:
    'Deletes a webhook from a form by its tag — the form stops sending events to that endpoint. Confirm with the user first. Needs the webhooks:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID'),
    tag: z.string().min(1).describe('Webhook tag to delete'),
  }),
  execute: async ({ typeformToken, formId, tag }) => {
    if (!formId || !tag) return { error: 'formId and tag are required.' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/webhooks/${encodeURIComponent(tag)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});
