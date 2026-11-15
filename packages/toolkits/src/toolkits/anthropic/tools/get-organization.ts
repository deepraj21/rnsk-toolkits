// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicGetOrganization = tool({
  description:
    'Gets the organization that owns the connected Anthropic credential (id, name, role). Requires a personal non-workspace-scoped key, an sk-ant-admin key, or an org:admin OAuth token — workspace-scoped keys are rejected.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
  }),
  execute: async ({ anthropicApiKey }) => {
    const result = await anthropicRequest(anthropicApiKey, '/v1/organizations/me');
    if (result.error) return result;

    return result.data;
  },
});
