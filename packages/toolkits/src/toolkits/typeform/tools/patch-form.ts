// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformPatchForm = tool({
  description:
    "Applies targeted operations to a typeform without replacing its whole definition — send a JSON array of { op, path, value } ops such as [{ op: 'replace', path: '/title', value: 'New title' }]. Paths: /title, /theme, /workspace, or /settings/<key>. Needs the forms:write scope.",
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID to update'),
    operations: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Operations array, e.g. [{ op: "replace", path: "/title", value: "New title" }] or [{ op: "replace", path: "/settings/is_public", value: false }]',
      ),
  }),
  execute: async ({ typeformToken, formId, operations }) => {
    if (!formId) return { error: 'formId is required.' };
    if (!operations || !operations.length)
      return { error: 'operations is required (at least one op).' };

    const result = await typeformRequest(typeformToken, `/forms/${encodeURIComponent(formId)}`, {
      method: 'PATCH',
      body: operations,
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
