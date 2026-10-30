// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest } from './client.js';

export const netlifyRestoreDeploy = tool({
  description:
    'Restores a previous Netlify deploy, making it the live/published deploy again — the standard way to roll a site back to an earlier version. This changes what visitors see.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    deployId: z.string().describe('Deploy id to restore and publish'),
  }),
  execute: async ({ netlifyToken, siteId, deployId }) => {
    const result = await netlifyRequest(
      netlifyToken,
      `/sites/${siteId}/deploys/${deployId}/restore`,
      { method: 'POST' },
    );
    if (result.error) return result;
    return { restored: true, siteId, deployId, deploy: result.data };
  },
});
