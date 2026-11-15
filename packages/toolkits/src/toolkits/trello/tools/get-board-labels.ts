// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetBoardLabels = tool({
  description:
    'Lists the labels defined on a Trello board with their id, name, and color. Use a returned label id with createCard / updateCard (idLabels) to tag cards.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    boardId: z.string().describe('Board id or short link'),
    fields: z.string().optional().describe('Comma-separated fields, e.g. "name,color"'),
    limit: z.number().min(1).max(1000).optional().describe('Max labels to return'),
  }),
  execute: async ({ trelloCredentials, boardId, fields, limit }) => {
    if (!boardId) return { error: 'boardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/boards/${encodeURIComponent(boardId)}/labels`,
      { query: { fields, limit } },
    );
    if (result.error) return result;

    return { labels: asList(result.data) };
  },
});
