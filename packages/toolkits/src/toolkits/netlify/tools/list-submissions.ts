// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, asList } from './client.js';

export const netlifyListSubmissions = tool({
  description:
    'Lists submissions of a Netlify form with page/per_page pagination, newest first. Each submission includes the submitted fields, email, and meta (ip, user agent, referrer).',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    formId: z.string().describe('Form id (from listForms)'),
    page: z.number().min(1).optional().describe('Page number (default 1)'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (1-100, default 20)'),
  }),
  execute: async ({ netlifyToken, formId, page, perPage }) => {
    const result = await netlifyRequest(netlifyToken, `/forms/${formId}/submissions`, {
      query: { page, per_page: perPage },
    });
    if (result.error) return result;
    return { submissions: asList(result.data), page: page ?? 1, perPage: perPage ?? 20 };
  },
});
