// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloGetWorkspace = tool({
  description:
    'Gets one Trello workspace (organization) by id: name, display name, URL, website, and logo.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    workspaceId: z.string().describe('Workspace (organization) id from listWorkspaces'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated workspace fields, e.g. "name,displayName,url"'),
  }),
  execute: async ({ trelloCredentials, workspaceId, fields }) => {
    if (!workspaceId) return { error: 'workspaceId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/organizations/${encodeURIComponent(workspaceId)}`,
      { query: { fields } },
    );
    if (result.error) return result;

    return result.data;
  },
});
