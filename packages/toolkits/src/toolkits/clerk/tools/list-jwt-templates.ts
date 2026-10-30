// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, shapeList } from './client.js';

export const clerkListJwtTemplates = tool({
  description:
    'Lists the JWT templates configured for the Clerk instance. Each template defines claims Clerk stamps into tokens minted for that template (used to authenticate users against third-party services).',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (default 10)'),
    offset: z.number().min(0).optional().describe('Number of results to skip'),
  }),
  execute: async ({ clerkToken, limit, offset }) => {
    const result = await clerkRequest(clerkToken, '/jwt_templates', {
      query: { limit, offset },
    });
    if (result.error) return result;

    const { items, totalCount } = shapeList(result);
    return { jwtTemplates: items, ...(totalCount !== undefined ? { totalCount } : {}) };
  },
});
