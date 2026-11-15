// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateCommentThread = tool({
  description:
    'Starts a new comment thread on a Canva design and returns the thread (id, author, message). To assign the comment, mention the user in the message as [user_id:team_id] and pass assigneeId (get IDs from canvaGetAuthenticatedUser or a user profile). Note: Canva has no endpoint to list all threads — keep the returned thread ID to read or reply later.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z.string().min(1).describe('Design ID to comment on'),
    messagePlaintext: z
      .string()
      .min(1)
      .max(2048)
      .describe('Comment text, max 2048 chars; mention users as [user_id:team_id]'),
    assigneeId: z
      .string()
      .optional()
      .describe('User ID to assign the comment to (must be mentioned in the message)'),
  }),
  execute: async ({ canvaToken, designId, messagePlaintext, assigneeId }) => {
    if (!designId) return { error: 'designId is required.' };
    if (!messagePlaintext) return { error: 'messagePlaintext is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/designs/${encodeURIComponent(designId)}/comments`,
      {
        method: 'POST',
        body: compact({ message_plaintext: messagePlaintext, assignee_id: assigneeId }),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
