// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, compact } from './client.js';

export const netlifyCreateBuildHook = tool({
  description:
    'Creates a build hook on a Netlify site: a URL that starts a build of the given branch when called with POST. Returns the hook URL — use it with triggerBuildHook or wire it into a CMS, CI, or cron job.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    title: z.string().describe('Hook title, e.g. "Rebuild on content publish"'),
    branch: z.string().optional().describe('Branch to build (defaults to the production branch)'),
  }),
  execute: async ({ netlifyToken, siteId, title, branch }) => {
    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}/build_hooks`, {
      method: 'POST',
      body: compact({ title, branch }),
    });
    if (result.error) return result;
    return result.data;
  },
});
