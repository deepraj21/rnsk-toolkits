// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, shapeList } from './client.js';

export const clerkListOrganizationInvitations = tool({
  description:
    'Lists invitations of a Clerk organization (pending, accepted, or revoked) with limit/offset pagination. Each invitation includes the invited email, role, status, and expiry.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    organizationId: z.string().describe('Organization ID or slug'),
    status: z
      .enum(['pending', 'accepted', 'revoked'])
      .optional()
      .describe('Filter by invitation status'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (default 10)'),
    offset: z.number().min(0).optional().describe('Number of results to skip'),
  }),
  execute: async ({ clerkToken, organizationId, status, limit, offset }) => {
    const result = await clerkRequest(clerkToken, `/organizations/${organizationId}/invitations`, {
      query: { status, limit, offset },
    });
    if (result.error) return result;

    const { items, totalCount } = shapeList(result);
    return { invitations: items, ...(totalCount !== undefined ? { totalCount } : {}) };
  },
});
