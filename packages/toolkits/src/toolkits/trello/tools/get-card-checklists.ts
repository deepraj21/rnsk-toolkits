// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetCardChecklists = tool({
  description:
    'Lists the checklists on a Trello card with their check items and each item’s state (complete/incomplete). Use it to read a card’s to-do list.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link'),
    checkItemFields: z
      .string()
      .optional()
      .describe('Comma-separated check item fields, e.g. "name,state,due"'),
  }),
  execute: async ({ trelloCredentials, cardId, checkItemFields }) => {
    if (!cardId) return { error: 'cardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/cards/${encodeURIComponent(cardId)}/checklists`,
      { query: { checkItem_fields: checkItemFields } },
    );
    if (result.error) return result;

    return { checklists: asList(result.data) };
  },
});
