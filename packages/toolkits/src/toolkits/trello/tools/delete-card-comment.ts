// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloDeleteCardComment = tool({
  description:
    'Deletes a comment from a Trello card. The actionId is the comment’s id from addCardComment or getCardComments. Only comment actions can be deleted.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    actionId: z.string().describe('Comment action id to delete'),
  }),
  execute: async ({ trelloCredentials, actionId }) => {
    if (!actionId) return { error: 'actionId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/actions/${encodeURIComponent(actionId)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, actionId, result: result.data };
  },
});
