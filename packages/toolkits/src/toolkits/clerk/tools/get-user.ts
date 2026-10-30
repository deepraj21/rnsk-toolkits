// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkGetUser = tool({
  description:
    'Gets one Clerk user by ID (user_xxx): identities, email addresses, phone numbers, username, external ID, public/private metadata, banned/locked state, and last sign-in.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    userId: z.string().describe('User ID, e.g. "user_2abc..."'),
  }),
  execute: async ({ clerkToken, userId }) => {
    const result = await clerkRequest(clerkToken, `/users/${userId}`);
    if (result.error) return result;
    return result.data;
  },
});
