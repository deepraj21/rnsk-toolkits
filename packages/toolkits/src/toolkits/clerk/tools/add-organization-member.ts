// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkAddOrganizationMember = tool({
  description:
    'Adds an existing Clerk user to an organization with a role (e.g. \"basic_member\", \"org:admin\"). The user must already exist (see createUser). Use createOrganizationInvitation instead to onboard someone by email.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    organizationId: z.string().describe('Organization ID or slug'),
    userId: z.string().describe('User ID (user_...) to add as a member'),
    role: z
      .string()
      .optional()
      .describe('Role to grant (default \"basic_member\"), e.g. \"org:admin\", \"org:member\"'),
  }),
  execute: async ({ clerkToken, organizationId, userId, role }) => {
    const result = await clerkRequest(clerkToken, `/organizations/${organizationId}/memberships`, {
      method: 'POST',
      query: { user_id: userId },
      body: role !== undefined ? { role } : undefined,
    });
    if (result.error) return result;
    return result.data;
  },
});
