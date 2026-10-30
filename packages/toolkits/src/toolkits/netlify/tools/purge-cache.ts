// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest } from './client.js';

export const netlifyPurgeCache = tool({
  description:
    'Purges Netlify’s CDN cache for a site — everything, or just content tagged with specific cache tags (deploy-purge tags from your functions). Visitors get fresh content on the next request. Purging the whole site is disruptive on busy sites; prefer cache_tags when possible.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain to purge cache for'),
    cacheTags: z
      .array(z.string())
      .optional()
      .describe('Only purge content with these cache tags (omit to purge the entire site cache)'),
  }),
  execute: async ({ netlifyToken, siteId, cacheTags }) => {
    const body = cacheTags?.length
      ? { site_id: siteId, cache_tags: cacheTags }
      : { site_id: siteId };
    const result = await netlifyRequest(netlifyToken, '/purge', { method: 'POST', body });
    if (result.error) return result;
    return {
      purged: true,
      siteId,
      ...(cacheTags?.length ? { cacheTags } : { scope: 'entire site' }),
    };
  },
});
