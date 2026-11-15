// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetCommentThread = tool({
  description:
    'Fetches one comment thread on a design by its thread ID: author, message, created/updated timestamps, resolved status, and replies. Use the thread ID returned by canvaCreateCommentThread (there is no list-threads endpoint).',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z.string().min(1).describe('Design ID the thread belongs to'),
    threadId: z.string().min(1).describe('Comment thread ID'),
  }),
  execute: async ({ canvaToken, designId, threadId }) => {
    if (!designId) return { error: 'designId is required.' };
    if (!threadId) return { error: 'threadId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/designs/${encodeURIComponent(designId)}/comments/${encodeURIComponent(threadId)}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
