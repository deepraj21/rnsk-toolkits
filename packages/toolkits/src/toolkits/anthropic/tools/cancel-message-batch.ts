// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicCancelMessageBatch = tool({
  description:
    'Cancels a message batch that is still processing. In-flight non-interruptible requests may finish first; re-fetch the batch afterwards to see how many requests were canceled. Batches already ended cannot be canceled.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    batchId: z.string().describe('Message batch ID to cancel'),
  }),
  execute: async ({ anthropicApiKey, batchId }) => {
    if (!batchId) return { error: 'batchId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/messages/batches/${encodeURIComponent(batchId)}/cancel`,
      { method: 'POST' },
    );
    if (result.error) return result;

    return result.data;
  },
});
