// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicListWorkspaces = tool({
  description:
    'Lists the workspaces in your Anthropic organization with cursor pagination, including each workspace’s id, name, status, and timestamps. Requires a personal non-workspace-scoped key, an sk-ant-admin key, or an org:admin OAuth token.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    afterId: z
      .string()
      .optional()
      .describe('Cursor: return the page immediately after this workspace ID'),
    beforeId: z
      .string()
      .optional()
      .describe('Cursor: return the page immediately before this workspace ID'),
    limit: z.number().min(1).max(1000).optional().describe('Items per page (default 20)'),
  }),
  execute: async ({ anthropicApiKey, afterId, beforeId, limit }) => {
    const result = await anthropicRequest(anthropicApiKey, '/v1/organizations/workspaces', {
      query: { after_id: afterId, before_id: beforeId, limit },
    });
    if (result.error) return result;

    const data = Array.isArray(result.data?.data) ? result.data.data : result.data;

    return {
      workspaces: (Array.isArray(data) ? data : []).map((workspace) => ({
        id: workspace.id,
        type: workspace.type,
        name: workspace.name,
        display_name: workspace.display_name,
        status: workspace.status,
        created_at: workspace.created_at,
        updated_at: workspace.updated_at,
      })),
      hasMore: Boolean(result.data?.has_more),
      firstId: result.data?.first_id,
      lastId: result.data?.last_id,
    };
  },
});
