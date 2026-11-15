// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicDeleteMessageBatch = tool({
  description:
    'Deletes a message batch once it has finished processing — cancel it first if it is still running. Batch data is also purged automatically 29 days after creation. Deleting is permanent.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    batchId: z.string().describe('Message batch ID to delete'),
  }),
  execute: async ({ anthropicApiKey, batchId }) => {
    if (!batchId) return { error: 'batchId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/messages/batches/${encodeURIComponent(batchId)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return result.data ?? { id: batchId, type: 'message_batch_deleted' };
  },
});
