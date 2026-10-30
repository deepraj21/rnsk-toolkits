// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, asList } from './client.js';

export const netlifyListSites = tool({
  description:
    'Lists the Netlify sites on the account with page/per_page pagination. Filter by name substring or a state filter. Returns each site with its id, name, url, ssl_url, admin_url, and account — use the site id for all other site tools.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    name: z.string().optional().describe('Filter sites whose name contains this substring'),
    filter: z
      .string()
      .optional()
      .describe('State filter, e.g. "preparing" or "error" — omit for all sites'),
    page: z.number().min(1).optional().describe('Page number (default 1)'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (1-100, default 20)'),
  }),
  execute: async ({ netlifyToken, name, filter, page, perPage }) => {
    const result = await netlifyRequest(netlifyToken, '/sites', {
      query: { name, filter, page, per_page: perPage },
    });
    if (result.error) return result;
    return { sites: asList(result.data), page: page ?? 1, perPage: perPage ?? 20 };
  },
});
