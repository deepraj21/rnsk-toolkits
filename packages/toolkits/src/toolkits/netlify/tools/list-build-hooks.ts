// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, asList } from './client.js';

export const netlifyListBuildHooks = tool({
  description:
    'Lists a Netlify site’s build hooks: each has a title, branch, and a URL that triggers a build when POSTed to. Use the hook URL with triggerBuildHook.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
  }),
  execute: async ({ netlifyToken, siteId }) => {
    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}/build_hooks`);
    if (result.error) return result;
    return { buildHooks: asList(result.data) };
  },
});
