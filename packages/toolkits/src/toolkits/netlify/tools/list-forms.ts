// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, asList } from './client.js';

export const netlifyListForms = tool({
  description:
    'Lists the forms detected on a Netlify site (from submitted form markup), each with its id, name, submission count, and fields. Use the form id to read or delete submissions.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
  }),
  execute: async ({ netlifyToken, siteId }) => {
    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}/forms`);
    if (result.error) return result;
    return { forms: asList(result.data) };
  },
});
