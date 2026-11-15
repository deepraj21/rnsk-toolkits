// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetWorkspaceBoards = tool({
  description:
    'Lists the boards inside a Trello workspace (organization). Filter to open, closed, public, or all boards. Returns each board’s id, name, and URL for use with the board/list/card tools.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    workspaceId: z.string().describe('Workspace (organization) id from listWorkspaces'),
    filter: z
      .enum(['all', 'closed', 'open', 'public'])
      .optional()
      .describe('Which boards to return (default "open")'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated board fields, e.g. "name,url,dateLastActivity"'),
    organizationFields: z.string().optional().describe('Workspace fields on the response'),
  }),
  execute: async ({ trelloCredentials, workspaceId, filter, fields, organizationFields }) => {
    if (!workspaceId) return { error: 'workspaceId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/organizations/${encodeURIComponent(workspaceId)}/boards`,
      { query: { filter, fields, organization_fields: organizationFields } },
    );
    if (result.error) return result;

    return { boards: asList(result.data) };
  },
});
