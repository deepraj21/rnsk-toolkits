// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, asList } from './client.js';

export const netlifyListDeploys = tool({
  description:
    'Lists a Netlify site’s deploys with page/per_page pagination, newest first. Returns each deploy with its id, state (ready/error/building), branch, commit sha/message, and URLs — use the deploy id to inspect, restore, or delete a deploy.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    page: z.number().min(1).optional().describe('Page number (default 1)'),
    perPage: z.number().min(1).max(100).optional().describe('Results per page (1-100, default 20)'),
  }),
  execute: async ({ netlifyToken, siteId, page, perPage }) => {
    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}/deploys`, {
      query: { page, per_page: perPage },
    });
    if (result.error) return result;
    return { deploys: asList(result.data), page: page ?? 1, perPage: perPage ?? 20 };
  },
});
