// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformUpdateFormMessages = tool({
  description:
    'Replaces the customizable messages (UI copy) of a typeform — pass only the keys you want to change, e.g. { "label.buttonHint.default": "Start", "label.button.submit": "Send" }. Max lengths and formatting (*bold*, _italic_) vary per key; HTML is forbidden. Needs the forms:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID'),
    messages: z
      .record(z.string())
      .describe(
        'Dotted message key → new text, e.g. { "label.error.required": "Please fill this in" }',
      ),
  }),
  execute: async ({ typeformToken, formId, messages }) => {
    if (!formId) return { error: 'formId is required.' };
    if (!messages || !Object.keys(messages).length) return { error: 'messages is required.' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/messages`,
      {
        method: 'PUT',
        body: messages,
      },
    );
    if (result.error) return result;

    return { updated: true, status: result.status, data: result.data ?? null };
  },
});
