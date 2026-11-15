// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetListCards = tool({
  description:
    'Lists the cards in a Trello list (column). Filter to open, closed (archived), or all cards. Returns each card’s id, name, description, due date, labels, and members.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    listId: z.string().describe('List id (from getBoardLists)'),
    filter: z
      .enum(['all', 'closed', 'none', 'open', 'visible'])
      .optional()
      .describe('Which cards to return (default "open")'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated card fields, e.g. "name,desc,due,idLabels"'),
    cardFields: z
      .string()
      .optional()
      .describe('Alias for card field selection on nested card objects'),
  }),
  execute: async ({ trelloCredentials, listId, filter, fields, cardFields }) => {
    if (!listId) return { error: 'listId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/lists/${encodeURIComponent(listId)}/cards`,
      { query: { filter, fields, card_fields: cardFields } },
    );
    if (result.error) return result;

    return { cards: asList(result.data) };
  },
});
