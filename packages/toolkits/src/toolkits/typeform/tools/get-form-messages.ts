// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformGetFormMessages = tool({
  description:
    'Gets the customizable messages (UI copy) of a typeform — button labels, error texts, hints, and placeholders, keyed by dotted names like "label.buttonHint.default". Use this before typeformUpdateFormMessages. Needs the forms:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID'),
  }),
  execute: async ({ typeformToken, formId }) => {
    if (!formId) return { error: 'formId is required.' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/messages`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
