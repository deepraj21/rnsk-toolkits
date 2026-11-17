// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformGetForm = tool({
  description:
    'Gets the full definition of one typeform — title, fields (questions), settings, logic, welcome/thank-you screens, and workspace. Use this to inspect a form before editing it. Needs the forms:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z
      .string()
      .min(1)
      .describe(
        'Form ID — the code in the form URL, e.g. u6nXL7 in https://mysite.typeform.com/to/u6nXL7',
      ),
  }),
  execute: async ({ typeformToken, formId }) => {
    if (!formId) return { error: 'formId is required.' };

    const result = await typeformRequest(typeformToken, `/forms/${encodeURIComponent(formId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
