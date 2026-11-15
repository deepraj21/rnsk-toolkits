// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloDeleteCard = tool({
  description:
    'Permanently deletes a Trello card. This cannot be undone — prefer updateCard closed=true to archive the card when you might need it back.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link (must be archived first)'),
  }),
  execute: async ({ trelloCredentials, cardId }) => {
    if (!cardId) return { error: 'cardId is required.' };

    const result = await trelloRequest(trelloCredentials, `/cards/${encodeURIComponent(cardId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    // Trello replies `_value` on success; surface a clear confirmation instead.
    return { deleted: true, cardId, result: result.data };
  },
});
