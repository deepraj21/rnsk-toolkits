// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloDeleteBoard = tool({
  description:
    'Permanently deletes a Trello board along with its lists, cards, and checklists. This cannot be undone — prefer updateBoard closed=true to archive the board when you might need it back.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    boardId: z.string().describe('Board id or short link to delete'),
  }),
  execute: async ({ trelloCredentials, boardId }) => {
    if (!boardId) return { error: 'boardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/boards/${encodeURIComponent(boardId)}`,
      {
        method: 'DELETE',
      },
    );
    if (result.error) return result;

    // Trello replies `_value` on success; surface a clear confirmation instead.
    return { deleted: true, boardId, result: result.data };
  },
});
