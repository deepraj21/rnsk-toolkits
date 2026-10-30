// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, resolveAccountId } from './client.js';

export const netlifyUpdateEnvVar = tool({
  description:
    "Updates an existing environment variable's value on a Netlify site (PATCH). Only the provided context's value changes; other contexts keep their values. Changes take effect on the next build/deploy.",
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    key: z.string().describe('Variable key to update, case-sensitive'),
    value: z.string().describe('New value'),
    context: z
      .enum(['all', 'dev', 'dev-server', 'branch-deploy', 'deploy-preview', 'production', 'branch'])
      .optional()
      .describe('Deploy context to set the value for (default "all")'),
  }),
  execute: async ({ netlifyToken, siteId, key, value, context }) => {
    const account = await resolveAccountId(netlifyToken, siteId);
    if (account.error) return account;

    const result = await netlifyRequest(
      netlifyToken,
      `/accounts/${account.accountId}/env/${encodeURIComponent(key)}`,
      {
        method: 'PATCH',
        query: { site_id: siteId },
        body: { values: [{ value, context: context ?? 'all' }] },
      },
    );
    if (result.error) return result;
    return result.data;
  },
});
