// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicListApiKeys = tool({
  description:
    'Lists the API keys in your Anthropic organization with cursor pagination — description, workspace, creator, last-used time, and status. Only metadata is returned, never the key values. Requires a personal non-workspace-scoped key, an sk-ant-admin key, or an org:admin OAuth token.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    afterId: z
      .string()
      .optional()
      .describe('Cursor: return the page immediately after this key ID'),
    beforeId: z
      .string()
      .optional()
      .describe('Cursor: return the page immediately before this key ID'),
    limit: z.number().min(1).max(1000).optional().describe('Items per page (default 20)'),
    workspaceIds: z
      .array(z.string())
      .optional()
      .describe('Restrict to keys in these workspace IDs'),
  }),
  execute: async ({ anthropicApiKey, afterId, beforeId, limit, workspaceIds }) => {
    const result = await anthropicRequest(anthropicApiKey, '/v1/organizations/api_keys', {
      query: {
        after_id: afterId,
        before_id: beforeId,
        limit,
        workspace_ids: workspaceIds,
      },
    });
    if (result.error) return result;

    const data = Array.isArray(result.data?.data) ? result.data.data : result.data;

    return {
      apiKeys: (Array.isArray(data) ? data : []).map((key) => ({
        id: key.id,
        type: key.type,
        description: key.description,
        workspace_id: key.workspace_id,
        created_at: key.created_at,
        created_by: key.created_by,
        last_used_at: key.last_used_at,
        status: key.status,
      })),
      hasMore: Boolean(result.data?.has_more),
      firstId: result.data?.first_id,
      lastId: result.data?.last_id,
    };
  },
});
