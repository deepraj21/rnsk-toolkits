// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicListMessageBatches = tool({
  description:
    'Lists your message batches with cursor pagination, including each batch’s processing status, request counts, and timestamps.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    afterId: z
      .string()
      .optional()
      .describe('Cursor: return the page immediately after this batch ID'),
    beforeId: z
      .string()
      .optional()
      .describe('Cursor: return the page immediately before this batch ID'),
    limit: z.number().min(1).max(1000).optional().describe('Items per page (1-1000, default 20)'),
  }),
  execute: async ({ anthropicApiKey, afterId, beforeId, limit }) => {
    const result = await anthropicRequest(anthropicApiKey, '/v1/messages/batches', {
      query: { after_id: afterId, before_id: beforeId, limit },
    });
    if (result.error) return result;

    const data = Array.isArray(result.data?.data) ? result.data.data : result.data;

    return {
      batches: (Array.isArray(data) ? data : []).map((batch) => ({
        id: batch.id,
        type: batch.type,
        processing_status: batch.processing_status,
        request_counts: batch.request_counts,
        created_at: batch.created_at,
        expires_at: batch.expires_at,
        started_at: batch.started_at,
        ended_at: batch.ended_at,
        results_url: batch.results_url,
      })),
      hasMore: Boolean(result.data?.has_more),
      firstId: result.data?.first_id,
      lastId: result.data?.last_id,
    };
  },
});
