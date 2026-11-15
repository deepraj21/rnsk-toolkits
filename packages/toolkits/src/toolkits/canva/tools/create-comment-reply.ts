// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateCommentReply = tool({
  description:
    'Adds a reply to an existing comment thread on a Canva design and returns the reply. Use the thread ID from canvaCreateCommentThread; mention users in the text as [user_id:team_id].',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z.string().min(1).describe('Design ID the thread belongs to'),
    threadId: z.string().min(1).describe('Comment thread ID to reply to'),
    messagePlaintext: z
      .string()
      .min(1)
      .max(2048)
      .describe('Reply text, max 2048 chars; mention users as [user_id:team_id]'),
  }),
  execute: async ({ canvaToken, designId, threadId, messagePlaintext }) => {
    if (!designId) return { error: 'designId is required.' };
    if (!threadId) return { error: 'threadId is required.' };
    if (!messagePlaintext) return { error: 'messagePlaintext is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/designs/${encodeURIComponent(designId)}/comments/${encodeURIComponent(threadId)}/replies`,
      {
        method: 'POST',
        body: compact({ message_plaintext: messagePlaintext }),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
