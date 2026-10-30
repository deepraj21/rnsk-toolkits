// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, shapeList } from './client.js';

export const clerkListOrganizations = tool({
  description:
    'Lists the organizations of the Clerk instance (newest first) with limit/offset pagination. Filter by name/domain query, by the user who belongs to them, or by member count. Use the organization ID or slug for all other organization tools.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    query: z.string().optional().describe('Partial match on organization name or slug'),
    domain: z.string().optional().describe('Only organizations verified with this domain'),
    userId: z.string().optional().describe('Only organizations this user belongs to'),
    includeMembersCount: z
      .boolean()
      .optional()
      .describe('Include each organization’s member count'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (default 10)'),
    offset: z.number().min(0).optional().describe('Number of results to skip'),
  }),
  execute: async ({ clerkToken, query, domain, userId, includeMembersCount, limit, offset }) => {
    const result = await clerkRequest(clerkToken, '/organizations', {
      query: {
        query,
        domain,
        user_id: userId,
        include_members_count: includeMembersCount,
        limit,
        offset,
      },
    });
    if (result.error) return result;

    const { items, totalCount } = shapeList(result);
    return { organizations: items, ...(totalCount !== undefined ? { totalCount } : {}) };
  },
});
