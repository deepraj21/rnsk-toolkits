// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkBanUser = tool({
  description:
    'Bans a Clerk user: they are signed out and cannot sign in again until unbanned. Use for moderation or abuse response when the user explicitly asks.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    userId: z.string().describe('User ID to ban'),
  }),
  execute: async ({ clerkToken, userId }) => {
    const result = await clerkRequest(clerkToken, `/users/${userId}/ban`, { method: 'POST' });
    if (result.error) return result;
    return { banned: true, userId };
  },
});
