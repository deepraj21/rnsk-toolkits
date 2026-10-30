// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, resolveAccountId } from './client.js';

export const netlifyCreateEnvVar = tool({
  description:
    'Creates an environment variable on a Netlify site (site-level, not account-shared). Provide the key, a value, and optionally the deploy context it applies to (default: all contexts) and scopes (builds/functions/runtime). Changes take effect on the next build/deploy. Errors if the key already exists — use updateEnvVar to change it.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    key: z.string().describe('Variable key, case-sensitive, e.g. "API_URL"'),
    value: z.string().describe('Variable value'),
    context: z
      .enum(['all', 'dev', 'dev-server', 'branch-deploy', 'deploy-preview', 'production', 'branch'])
      .optional()
      .describe('Deploy context this value applies to (default "all")'),
    scopes: z
      .array(z.enum(['builds', 'functions', 'runtime', 'post-processing']))
      .optional()
      .describe('Where the variable is exposed (default: all scopes)'),
    isSecret: z
      .boolean()
      .optional()
      .describe('Hide the value in the UI/API (only readable by code on Netlify)'),
  }),
  execute: async ({ netlifyToken, siteId, key, value, context, scopes, isSecret }) => {
    const account = await resolveAccountId(netlifyToken, siteId);
    if (account.error) return account;

    const result = await netlifyRequest(netlifyToken, `/accounts/${account.accountId}/env`, {
      method: 'POST',
      query: { site_id: siteId },
      body: [
        {
          key,
          values: [{ value, context: context ?? 'all' }],
          ...(scopes ? { scopes } : {}),
          ...(isSecret !== undefined ? { is_secret: isSecret } : {}),
        },
      ],
    });
    if (result.error) return result;
    return result.data;
  },
});
