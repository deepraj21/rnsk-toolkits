// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaListBrandTemplates = tool({
  description:
    'Lists the brand templates the user can access (id, title, view/create URLs, timestamps) with search, sorting, and continuation-token paging. Brand templates are the input for canvaCreateDesignAutofillJob and canvaPublishBrandTemplate.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    query: z.string().max(255).optional().describe('Search term to filter templates by title'),
    continuation: z.string().optional().describe('Continuation token from a previous page'),
    limit: z.number().int().min(1).max(100).optional().describe('Page size, 1-100 (default 50)'),
    sortBy: z
      .enum([
        'relevance',
        'modified_descending',
        'modified_ascending',
        'title_descending',
        'title_ascending',
      ])
      .optional()
      .describe('Sort order (default relevance)'),
  }),
  execute: async ({ canvaToken, query, continuation, limit, sortBy }) => {
    const result = await canvaRequest(canvaToken, '/brand-templates', {
      query: { query, continuation, limit, sort_by: sortBy },
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      items: Array.isArray(data.items) ? data.items : [],
      continuation: data.continuation ?? null,
    };
  },
});
