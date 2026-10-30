// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, asList } from './client.js';

export const netlifyListFunctions = tool({
  description:
    'Lists the serverless functions deployed on a Netlify site (from the latest deploy), with their names, runtime, and node version. Filter by name substring.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    filter: z.string().optional().describe('Only functions whose name contains this substring'),
  }),
  execute: async ({ netlifyToken, siteId, filter }) => {
    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}/functions`, {
      query: { filter },
    });
    if (result.error) return result;
    return { functions: asList(result.data) };
  },
});
