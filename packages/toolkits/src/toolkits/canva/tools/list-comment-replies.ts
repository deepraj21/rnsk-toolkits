// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaListCommentReplies = tool({
  description:
    'Lists the replies in a comment thread on a design (author, message, timestamps) with limit/continuation paging. Use after canvaCreateCommentThread or canvaGetCommentThread to follow a discussion.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z.string().min(1).describe('Design ID the thread belongs to'),
    threadId: z.string().min(1).describe('Comment thread ID'),
    limit: z.number().int().min(1).max(100).optional().describe('Page size, 1-100 (default 50)'),
    continuation: z.string().optional().describe('Continuation token from a previous page'),
  }),
  execute: async ({ canvaToken, designId, threadId, limit, continuation }) => {
    if (!designId) return { error: 'designId is required.' };
    if (!threadId) return { error: 'threadId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/designs/${encodeURIComponent(designId)}/comments/${encodeURIComponent(threadId)}/replies`,
      { query: { limit, continuation } },
    );
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      items: Array.isArray(data.items) ? data.items : [],
      continuation: data.continuation ?? null,
    };
  },
});
