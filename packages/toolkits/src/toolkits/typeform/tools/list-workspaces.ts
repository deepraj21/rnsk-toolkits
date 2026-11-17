// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformListWorkspaces = tool({
  description:
    'Lists every workspace the connected account can access across organizations, as a page of summaries — each includes its ID, name, owning account, shared flag, and form count. Use the IDs for form moves and the other workspace tools. Needs the workspaces:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    search: z.string().optional().describe('Only workspaces whose name contains this text'),
    page: z.number().int().min(1).optional().describe('Page number, default 1'),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe('Workspaces per page, 1-200 (default 10)'),
  }),
  execute: async ({ typeformToken, search, page, pageSize }) => {
    const result = await typeformRequest(typeformToken, '/workspaces', {
      query: { search, page, page_size: pageSize },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
