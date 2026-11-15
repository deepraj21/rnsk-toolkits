// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloUpdateCardComment = tool({
  description:
    'Edits an existing comment on a Trello card. The actionId is the comment’s id returned by addCardComment (or from getCardComments).',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    actionId: z.string().describe('Comment action id (from addCardComment / getCardComments)'),
    text: z.string().min(1).describe('New comment text'),
  }),
  execute: async ({ trelloCredentials, actionId, text }) => {
    if (!actionId) return { error: 'actionId is required.' };
    if (!text) return { error: 'text is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/actions/${encodeURIComponent(actionId)}/text`,
      { method: 'PUT', query: { value: text } },
    );
    if (result.error) return result;

    return result.data;
  },
});
