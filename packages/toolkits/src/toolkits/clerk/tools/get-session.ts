// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest } from './client.js';

export const clerkGetSession = tool({
  description:
    'Gets one Clerk session by ID: status, user and client IDs, active organization, created/last-active/expire times, and factor counts.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    sessionId: z.string().describe('Session ID, e.g. "sess_2abc..."'),
  }),
  execute: async ({ clerkToken, sessionId }) => {
    const result = await clerkRequest(clerkToken, `/sessions/${sessionId}`);
    if (result.error) return result;
    return result.data;
  },
});
