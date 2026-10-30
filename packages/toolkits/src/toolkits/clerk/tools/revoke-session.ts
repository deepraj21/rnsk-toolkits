// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkRevokeSession = tool({
  description:
    'Revokes a Clerk session, signing that device out immediately. Use to force a sign-out (e.g. security response, "log this device out"). To end all of a user’s sessions, revoke each one from listSessions filtered by user.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    sessionId: z.string().describe('Session ID to revoke'),
  }),
  execute: async ({ clerkToken, sessionId }) => {
    const result = await clerkRequest(clerkToken, `/sessions/${sessionId}/revoke`, {
      method: 'POST',
    });
    if (result.error) return result;
    return { revoked: true, sessionId };
  },
});
