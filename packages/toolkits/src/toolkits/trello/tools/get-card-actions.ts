// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetCardActions = tool({
  description:
    'Lists the activity history (actions) on a Trello card — comments, created/updated/moved events, member and label changes. Filter by action type and date range.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link'),
    filter: z
      .string()
      .optional()
      .describe(
        'Comma-separated action types, e.g. "commentCard,createCard,updateCard" (default: all)',
      ),
    limit: z.number().min(1).max(1000).optional().describe('Max actions (default 50)'),
    since: z.string().optional().describe('Only actions after this ISO date'),
    before: z.string().optional().describe('Only actions before this ISO date'),
  }),
  execute: async ({ trelloCredentials, cardId, filter, limit, since, before }) => {
    if (!cardId) return { error: 'cardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/cards/${encodeURIComponent(cardId)}/actions`,
      { query: { filter, limit, since, before } },
    );
    if (result.error) return result;

    return { actions: asList(result.data) };
  },
});
