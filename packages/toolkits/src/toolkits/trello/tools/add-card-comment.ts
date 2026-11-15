// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloAddCardComment = tool({
  description:
    'Adds a comment to a Trello card and returns the created comment action (including its id, which you can use to edit or delete the comment later).',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link'),
    text: z.string().min(1).describe('Comment text (markdown supported)'),
  }),
  execute: async ({ trelloCredentials, cardId, text }) => {
    if (!cardId) return { error: 'cardId is required.' };
    if (!text) return { error: 'text is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/cards/${encodeURIComponent(cardId)}/actions/comments`,
      { method: 'POST', query: { text } },
    );
    if (result.error) return result;

    return result.data;
  },
});
