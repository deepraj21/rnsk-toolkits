// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkCreateSignInToken = tool({
  description:
    'Creates a sign-in token for a Clerk user — a one-time token that lets you sign that user in without a password (e.g. impersonation / support "login as user" links). The response includes the token string and its expiration; short-lived and sensitive — never log or expose it.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    userId: z.string().describe('User ID (user_...) to create the sign-in token for'),
    expiresInSeconds: z.number().optional().describe('Token lifetime in seconds (default 300)'),
  }),
  execute: async ({ clerkToken, userId, expiresInSeconds }) => {
    const result = await clerkRequest(clerkToken, '/sign_in_tokens', {
      method: 'POST',
      query: { user_id: userId },
      body: expiresInSeconds !== undefined ? { expires_in_seconds: expiresInSeconds } : undefined,
    });
    if (result.error) return result;
    return result.data;
  },
});
