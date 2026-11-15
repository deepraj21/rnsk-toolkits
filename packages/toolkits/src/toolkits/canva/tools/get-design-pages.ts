// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetDesignPages = tool({
  description:
    'Lists the pages of a Canva design (page number, thumbnail, embedded elements) with offset/limit paging. Use when you need per-page detail beyond the page count on a design.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    designId: z.string().min(1).describe('Design ID to list pages for'),
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('0-based index of the first page to return (default 0)'),
    limit: z.number().int().min(1).optional().describe('Number of pages to return from the offset'),
  }),
  execute: async ({ canvaToken, designId, offset, limit }) => {
    if (!designId) return { error: 'designId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/designs/${encodeURIComponent(designId)}/pages`,
      {
        query: { offset, limit },
      },
    );
    if (result.error) return result;

    const data = result.data ?? {};
    return { items: Array.isArray(data.items) ? data.items : [] };
  },
});
