// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformListForms = tool({
  description:
    'Lists the typeforms in the account as a page of summaries (total_items/page_count) — filter by title search, workspace, or visibility, and sort by created or last updated. Use this to find form IDs, then typeformGetForm for the full definition. Needs the forms:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    search: z.string().optional().describe('Only forms whose title contains this text'),
    workspaceId: z
      .string()
      .optional()
      .describe('Only forms stored in this workspace (workspace ID)'),
    page: z.number().int().min(1).optional().describe('Page number, default 1'),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe('Forms per page, 1-200 (default 10)'),
    sortBy: z
      .enum(['created_at', 'last_updated_at'])
      .optional()
      .describe('Sort field (created_at or last_updated_at)'),
    orderBy: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    isPublic: z
      .boolean()
      .optional()
      .describe('Filter forms by visibility: true = public forms, false = private'),
  }),
  execute: async ({
    typeformToken,
    search,
    workspaceId,
    page,
    pageSize,
    sortBy,
    orderBy,
    isPublic,
  }) => {
    const result = await typeformRequest(typeformToken, '/forms', {
      query: {
        search,
        workspace_id: workspaceId,
        page,
        page_size: pageSize,
        sort_by: sortBy,
        order_by: orderBy,
        is_public: isPublic,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
