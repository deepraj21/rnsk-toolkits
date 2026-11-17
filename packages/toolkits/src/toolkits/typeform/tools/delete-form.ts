// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformDeleteForm = tool({
  description:
    'Deletes a typeform permanently, along with its responses. This cannot be undone — confirm with the user first. Needs the forms:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID to delete'),
  }),
  execute: async ({ typeformToken, formId }) => {
    if (!formId) return { error: 'formId is required.' };

    const result = await typeformRequest(typeformToken, `/forms/${encodeURIComponent(formId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});
