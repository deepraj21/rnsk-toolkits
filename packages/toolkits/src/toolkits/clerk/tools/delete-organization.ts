// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkDeleteOrganization = tool({
  description:
    'Permanently deletes a Clerk organization, including its memberships and invitations. This cannot be undone — use only when the user explicitly asks.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    organizationId: z.string().describe('Organization ID or slug to delete'),
  }),
  execute: async ({ clerkToken, organizationId }) => {
    const result = await clerkRequest(clerkToken, `/organizations/${organizationId}`, {
      method: 'DELETE',
    });
    if (result.error) return result;
    return { deleted: true, organizationId };
  },
});
