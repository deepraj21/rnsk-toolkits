// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressListBloggingPrompts = tool({
  description: 'List WordPress.com writing prompts for a site, optionally filtered by date or text, with agent-controlled pagination.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
    siteId: z.number().describe('Numeric site ID returned by WORDPRESS_COM_LIST_SITES.'),
    search: z.string().optional().describe('Limit prompts to text matching this query.'),
    before: z.string().optional().describe('Return prompts before this ISO 8601 date.'),
    after: z.string().optional().describe('Return prompts after this ISO 8601 date.'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction by prompt date.'),
    year: z.number().min(2000).max(2100).optional().describe('Return the prompt calendar for this year.'),
    cursor: z.string().optional().describe('Opaque continuation cursor returned by a previous call.'),
    pageSize: z.number().min(1).max(100).optional().describe('Maximum prompts in this page.'),
  }),
  execute: async ({ wordpressToken, siteId, search, before, after, order, year, cursor, pageSize }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    try {
      const res = await wpFetch(`/wpcom/v2/blogging-prompts`, {
        wordpressToken,
        method: 'GET',
        query: {
          site_id: siteId,
          search,
          before,
          after,
          order,
          year,
          cursor,
          per_page: pageSize,
          number: pageSize,
        },
      });
      if (!res.ok) return { error: 'Failed to list blogging prompts', details: res.data };
      const data = res.data;
      // Normalize to expected shape
      const items = data.prompts ?? data.items ?? data.blogging_prompts ?? [];
      return {
        items,
        hasMore: data.has_more ?? data.hasMore ?? false,
        nextCursor: data.next_cursor ?? data.nextCursor ?? null,
        total: data.total ?? data.found ?? undefined,
        totalPages: data.total_pages ?? data.totalPages ?? undefined,
      };
    } catch (e) {
      return { error: 'Error listing blogging prompts', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
