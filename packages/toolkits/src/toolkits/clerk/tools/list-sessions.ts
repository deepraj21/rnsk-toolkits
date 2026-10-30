// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, shapeList } from './client.js';

export const clerkListSessions = tool({
  description:
    'Lists sessions of the Clerk instance with limit/offset pagination, filterable by user, client, or status (active/revoked/ended/removed/expired). Use it to see where and when users are signed in.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    userId: z.string().optional().describe('Only sessions of this user ID'),
    clientId: z.string().optional().describe('Only sessions of this client ID'),
    status: z
      .enum(['active', 'revoked', 'ended', 'removed', 'expired', 'pending'])
      .optional()
      .describe('Filter by session status'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (default 10)'),
    offset: z.number().min(0).optional().describe('Number of results to skip'),
    paginated: z.boolean().optional().describe('Include pagination info in the response'),
  }),
  execute: async ({ clerkToken, userId, clientId, status, limit, offset, paginated }) => {
    const result = await clerkRequest(clerkToken, '/sessions', {
      query: { user_id: userId, client_id: clientId, status, limit, offset, paginated },
    });
    if (result.error) return result;

    const { items, totalCount } = shapeList(result);
    return { sessions: items, ...(totalCount !== undefined ? { totalCount } : {}) };
  },
});
