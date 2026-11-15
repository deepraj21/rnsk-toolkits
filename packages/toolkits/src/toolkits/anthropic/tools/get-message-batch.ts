// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicGetMessageBatch = tool({
  description:
    'Gets one message batch by ID: processing status (in_progress, canceling, ended), request counts (succeeded, errored, canceled, expired, processing), and timestamps. Poll this until processing_status is "ended", then call getMessageBatchResults.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    batchId: z.string().describe('Message batch ID, e.g. "msgbatch_01..."'),
  }),
  execute: async ({ anthropicApiKey, batchId }) => {
    if (!batchId) return { error: 'batchId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/messages/batches/${encodeURIComponent(batchId)}`,
    );
    if (result.error) return result;

    return result.data;
  },
});
