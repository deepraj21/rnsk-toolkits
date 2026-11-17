// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformDeleteResponses = tool({
  description:
    'Deletes specific responses (submissions) from a form — up to 1000 response IDs per call. Permanent and irreversible; confirm with the user before calling. Needs the responses:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID the responses belong to'),
    responseIds: z.array(z.string()).min(1).max(1000).describe('Response IDs to delete (max 1000)'),
  }),
  execute: async ({ typeformToken, formId, responseIds }) => {
    if (!formId) return { error: 'formId is required.' };
    if (!responseIds || !responseIds.length)
      return { error: 'responseIds is required (at least one).' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/responses`,
      {
        method: 'DELETE',
        query: { included_response_ids: responseIds },
      },
    );
    if (result.error) return result;

    return { deleted: true, status: result.status, data: result.data ?? null };
  },
});
