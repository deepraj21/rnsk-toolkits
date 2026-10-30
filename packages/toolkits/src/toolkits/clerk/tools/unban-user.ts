// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkUnbanUser = tool({
  description: 'Removes a ban from a Clerk user so they can sign in again.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    userId: z.string().describe('User ID to unban'),
  }),
  execute: async ({ clerkToken, userId }) => {
    const result = await clerkRequest(clerkToken, `/users/${userId}/unban`, { method: 'POST' });
    if (result.error) return result;
    return { banned: false, userId };
  },
});
