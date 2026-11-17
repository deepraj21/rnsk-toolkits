// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformListThemes = tool({
  description:
    'Lists the themes in the account as a page of summaries (total_items/page_count) — use the returned theme IDs with typeformGetForm or the other theme tools. Needs the themes:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    page: z.number().int().min(1).optional().describe('Page number, default 1'),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe('Themes per page, 1-200 (default 10)'),
  }),
  execute: async ({ typeformToken, page, pageSize }) => {
    const result = await typeformRequest(typeformToken, '/themes', {
      query: { page, page_size: pageSize },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
