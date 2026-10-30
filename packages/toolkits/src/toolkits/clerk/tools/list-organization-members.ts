// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, shapeList } from './client.js';

export const clerkListOrganizationMembers = tool({
  description:
    'Lists the members of a Clerk organization with limit/offset pagination. Each membership includes the user (id, name, email), their role, and membership status.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    organizationId: z.string().describe('Organization ID or slug'),
    query: z.string().optional().describe('Partial match on the member’s user ID or name'),
    role: z
      .array(z.string())
      .optional()
      .describe('Only memberships with these roles, e.g. [\"org:admin\"]'),
    includeMembersCount: z.boolean().optional().describe('Include the organization member count'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (default 10)'),
    offset: z.number().min(0).optional().describe('Number of results to skip'),
  }),
  execute: async ({
    clerkToken,
    organizationId,
    query,
    role,
    includeMembersCount,
    limit,
    offset,
  }) => {
    const result = await clerkRequest(clerkToken, `/organizations/${organizationId}/memberships`, {
      query: { query, role, include_members_count: includeMembersCount, limit, offset },
    });
    if (result.error) return result;

    const { items, totalCount } = shapeList(result);
    return { members: items, ...(totalCount !== undefined ? { totalCount } : {}) };
  },
});
