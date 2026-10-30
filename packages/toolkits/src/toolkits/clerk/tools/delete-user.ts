// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkDeleteUser = tool({
  description:
    'Permanently deletes a Clerk user, including their sessions, identities, and metadata. This cannot be undone — use only when the user explicitly asks (e.g. account deletion / GDPR request).',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    userId: z.string().describe('User ID to delete'),
  }),
  execute: async ({ clerkToken, userId }) => {
    const result = await clerkRequest(clerkToken, `/users/${userId}`, { method: 'DELETE' });
    if (result.error) return result;
    return { deleted: true, userId };
  },
});
