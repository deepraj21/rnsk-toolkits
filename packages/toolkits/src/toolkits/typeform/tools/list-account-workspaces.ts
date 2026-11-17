// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformListAccountWorkspaces = tool({
  description:
    'Lists the workspaces inside one Typeform organization (account) — use when you know the account ID and want only that organization’s workspaces, rather than every workspace across organizations. Needs the workspaces:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    accountId: z.string().min(1).describe('Account (organization) ID'),
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
  execute: async ({ typeformToken, accountId, search, page, pageSize }) => {
    if (!accountId) return { error: 'accountId is required.' };

    const result = await typeformRequest(
      typeformToken,
      `/accounts/${encodeURIComponent(accountId)}/workspaces`,
      { query: { search, page, page_size: pageSize } },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
