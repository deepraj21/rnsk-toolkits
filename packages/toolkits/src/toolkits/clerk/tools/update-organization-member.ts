// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkUpdateOrganizationMember = tool({
  description:
    'Changes a member’s role in a Clerk organization (e.g. promote basic_member to org:admin, or demote them).',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    organizationId: z.string().describe('Organization ID or slug'),
    userId: z.string().describe('Member user ID whose role to change'),
    role: z.string().describe('New role, e.g. \"basic_member\", \"org:admin\"'),
  }),
  execute: async ({ clerkToken, organizationId, userId, role }) => {
    const result = await clerkRequest(
      clerkToken,
      `/organizations/${organizationId}/memberships/${userId}`,
      {
        method: 'PATCH',
        body: { role },
      },
    );
    if (result.error) return result;
    return result.data;
  },
});
