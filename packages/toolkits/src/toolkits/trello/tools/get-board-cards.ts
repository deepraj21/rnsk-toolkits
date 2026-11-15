// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetBoardCards = tool({
  description:
    'Lists all the cards on a Trello board across every list. Filter to open, closed (archived), all, or visible cards. Use it for a whole-board overview, or use getListCards for a single column.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    boardId: z.string().describe('Board id or short link'),
    filter: z
      .enum(['all', 'closed', 'none', 'open', 'visible'])
      .optional()
      .describe('Which cards to return (default "all" open cards)'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated card fields, e.g. "name,desc,due,idList"'),
    lists: z
      .string()
      .optional()
      .describe('Restrict to these list ids (comma-separated) — requires filter support'),
    limit: z.number().min(1).max(1000).optional().describe('Max cards to return (1-1000)'),
  }),
  execute: async ({ trelloCredentials, boardId, filter, fields, lists, limit }) => {
    if (!boardId) return { error: 'boardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/boards/${encodeURIComponent(boardId)}/cards`,
      { query: { filter, fields, lists, limit } },
    );
    if (result.error) return result;

    return { cards: asList(result.data) };
  },
});
