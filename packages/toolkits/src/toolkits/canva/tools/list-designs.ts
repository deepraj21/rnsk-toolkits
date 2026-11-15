// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaListDesigns = tool({
  description:
    "Lists the connected user's Canva designs (id, title, owner, page count, thumbnail, edit/view URLs). Search by keyword, filter by ownership, sort, and page through results using the returned continuation token. Use canvaGetDesign for full details of one design.",
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    query: z.string().max(255).optional().describe('Search term to filter designs by title'),
    continuation: z.string().optional().describe('Continuation token from a previous page'),
    ownership: z
      .enum(['any', 'owned', 'shared'])
      .optional()
      .describe('Filter: owned by user, shared with them, or either (default any)'),
    sortBy: z
      .enum([
        'relevance',
        'modified_descending',
        'modified_ascending',
        'title_descending',
        'title_ascending',
      ])
      .optional()
      .describe('Sort order (default relevance when searching, otherwise modified_descending)'),
    limit: z.number().int().min(1).max(100).optional().describe('Page size, 1-100 (default 25)'),
  }),
  execute: async ({ canvaToken, query, continuation, ownership, sortBy, limit }) => {
    const result = await canvaRequest(canvaToken, '/designs', {
      query: {
        query,
        continuation,
        ownership,
        sort_by: sortBy,
        limit,
      },
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      items: Array.isArray(data.items) ? data.items : [],
      continuation: data.continuation ?? null,
    };
  },
});
