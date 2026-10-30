// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest } from './client.js';

export const netlifyGetSite = tool({
  description:
    'Gets one Netlify site by id or name: live/ssl/admin URLs, custom domain, git provider and build settings, published deploy, plan, and account_id. The site "id" may also be the site subdomain/name.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain, e.g. "my-site"'),
  }),
  execute: async ({ netlifyToken, siteId }) => {
    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}`);
    if (result.error) return result;
    return result.data;
  },
});
