// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkRemoveOrganizationMember = tool({
  description:
    'Removes a member from a Clerk organization (the user still exists, they just lose access to this org). Use only when the user explicitly asks to remove someone.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    organizationId: z.string().describe('Organization ID or slug'),
    userId: z.string().describe('Member user ID to remove'),
  }),
  execute: async ({ clerkToken, organizationId, userId }) => {
    const result = await clerkRequest(
      clerkToken,
      `/organizations/${organizationId}/memberships/${userId}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;
    return { removed: true, organizationId, userId };
  },
});
