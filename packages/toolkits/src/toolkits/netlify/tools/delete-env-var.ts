// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, resolveAccountId } from './client.js';

export const netlifyDeleteEnvVar = tool({
  description:
    'Deletes an environment variable from a Netlify site (all contexts and scopes). Use only when the user explicitly asks to remove it; to just change a value use updateEnvVar.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    key: z.string().describe('Variable key to delete, case-sensitive'),
  }),
  execute: async ({ netlifyToken, siteId, key }) => {
    const account = await resolveAccountId(netlifyToken, siteId);
    if (account.error) return account;

    const result = await netlifyRequest(
      netlifyToken,
      `/accounts/${account.accountId}/env/${encodeURIComponent(key)}`,
      {
        method: 'DELETE',
        query: { site_id: siteId },
      },
    );
    if (result.error) return result;
    return { deleted: true, siteId, key };
  },
});
