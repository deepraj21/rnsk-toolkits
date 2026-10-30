// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest } from './client.js';

export const netlifyDeleteSite = tool({
  description:
    'Deletes a Netlify site permanently (site, deploys, and forms). Use only when the user explicitly asks to remove a site.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain to delete'),
  }),
  execute: async ({ netlifyToken, siteId }) => {
    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}`, {
      method: 'DELETE',
    });
    if (result.error) return result;
    return { deleted: true, siteId };
  },
});
