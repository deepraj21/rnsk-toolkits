// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetCardComments = tool({
  description:
    'Lists the comments on a Trello card (commentCard actions), newest first, with the author and timestamp. Use it to read a card’s conversation thread.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link'),
    limit: z.number().min(1).max(1000).optional().describe('Max comments to return (default 50)'),
    since: z.string().optional().describe('Only comments after this ISO date, e.g. "2026-01-01"'),
    before: z.string().optional().describe('Only comments before this ISO date'),
  }),
  execute: async ({ trelloCredentials, cardId, limit, since, before }) => {
    if (!cardId) return { error: 'cardId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/cards/${encodeURIComponent(cardId)}/actions`,
      { query: { filter: 'commentCard', limit, since, before } },
    );
    if (result.error) return result;

    return { comments: asList(result.data) };
  },
});
