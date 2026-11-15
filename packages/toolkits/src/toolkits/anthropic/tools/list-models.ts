// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicListModels = tool({
  description:
    'Lists the Claude models available to your account (newest first) with cursor pagination. Filter by lifecycle stage: active, deprecated, or retired. Use the returned IDs with createMessage and countTokens.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    afterId: z
      .string()
      .optional()
      .describe('Cursor: return the page immediately after this model ID'),
    beforeId: z
      .string()
      .optional()
      .describe('Cursor: return the page immediately before this model ID'),
    lifecycle: z
      .array(z.enum(['active', 'deprecated', 'retired']))
      .optional()
      .describe('Filter to these lifecycle stages (max 3; omit for active + deprecated)'),
    limit: z.number().min(1).max(1000).optional().describe('Items per page (1-1000, default 20)'),
  }),
  execute: async ({ anthropicApiKey, afterId, beforeId, lifecycle, limit }) => {
    const result = await anthropicRequest(anthropicApiKey, '/v1/models', {
      query: { after_id: afterId, before_id: beforeId, lifecycle, limit },
    });
    if (result.error) return result;

    const data = Array.isArray(result.data?.data) ? result.data.data : result.data;

    return {
      models: (Array.isArray(data) ? data : []).map((model) => ({
        id: model.id,
        display_name: model.display_name,
        created_at: model.created_at,
        type: model.type,
        lifecycle: model.lifecycle,
        capabilities: model.capabilities,
      })),
      hasMore: Boolean(result.data?.has_more),
      firstId: result.data?.first_id,
      lastId: result.data?.last_id,
    };
  },
});
