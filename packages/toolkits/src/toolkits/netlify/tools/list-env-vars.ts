// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, asList } from './client.js';

export const netlifyListEnvVars = tool({
  description:
    "Lists a Netlify site's environment variables with their deploy contexts (production, deploy-preview, branch-deploy) and scopes (builds, functions, runtime). Secret variables show redacted metadata only.",
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    contextName: z
      .enum(['all', 'dev', 'dev-server', 'branch-deploy', 'deploy-preview', 'production', 'branch'])
      .optional()
      .describe('Only variables that apply to this deploy context'),
    scope: z
      .enum(['builds', 'functions', 'runtime', 'post-processing'])
      .optional()
      .describe('Only variables with this scope'),
  }),
  execute: async ({ netlifyToken, siteId, contextName, scope }) => {
    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}/env`, {
      query: { context_name: contextName, scope },
    });
    if (result.error) return result;
    return { envVars: asList(result.data) };
  },
});
