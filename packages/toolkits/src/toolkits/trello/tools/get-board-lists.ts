// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetBoardLists = tool({
  description:
    'Lists the lists (columns) on a Trello board in board order. Filter to open, closed (archived), or all lists. Use a returned list id as idList when creating cards.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    boardId: z.string().describe('Board id or short link'),
    filter: z
      .enum(['all', 'closed', 'none', 'open'])
      .optional()
      .describe('Which lists to return (default "open")'),
    fields: z.string().optional().describe('Comma-separated list fields, e.g. "name,closed,pos"'),
  }),
  execute: async ({ trelloCredentials, boardId, filter, fields }) => {
    if (!boardId) return { error: 'boardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/boards/${encodeURIComponent(boardId)}/lists`,
      { query: { filter, fields } },
    );
    if (result.error) return result;

    return { lists: asList(result.data) };
  },
});
