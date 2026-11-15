// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest, parseJsonl } from './client.js';

export const anthropicGetMessageBatchResults = tool({
  description:
    'Downloads the results of a finished message batch as parsed JSONL — one entry per request, each with its custom_id and the model’s response. Results may arrive in any order, so match on custom_id. Only works once the batch’s processing_status is "ended".',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    batchId: z.string().describe('Message batch ID whose results to fetch'),
  }),
  execute: async ({ anthropicApiKey, batchId }) => {
    if (!batchId) return { error: 'batchId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/messages/batches/${encodeURIComponent(batchId)}/results`,
    );
    if (result.error) return result;

    const parsed = parseJsonl(result.data);

    if (!Array.isArray(parsed)) {
      // Unexpected non-JSONL body — hand it back untouched.
      return { raw: parsed };
    }

    return {
      count: parsed.length,
      results: parsed.map((line) => ({
        custom_id: line.custom_id,
        result: line.result,
      })),
    };
  },
});
