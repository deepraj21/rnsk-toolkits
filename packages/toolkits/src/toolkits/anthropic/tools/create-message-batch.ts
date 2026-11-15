// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest, snakeBatchParams, compact } from './client.js';

function normalizeRequest(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  // Accept { custom_id, params } or a bare params object carrying customId.
  if (entry.params || entry.custom_id) {
    return compact({
      custom_id: entry.custom_id ?? entry.customId,
      params: snakeBatchParams(entry.params),
    });
  }
  return compact({
    custom_id: entry.custom_id ?? entry.customId,
    params: snakeBatchParams(entry),
  });
}

export const anthropicCreateMessageBatch = tool({
  description:
    'Creates a batch of many Claude message requests to run asynchronously at a 50% discount (results within 24 hours). Provide requests as [{ custom_id, params }] — params mirror createMessage (model, max_tokens, messages, ...). camelCase params are converted to the API’s snake_case. Use the custom_id to match results later.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    requests: z
      .array(
        z.object({
          customId: z.string().describe('Your unique ID for this request'),
          params: z
            .unknown()
            .describe(
              'Message params: { model, maxTokens, messages, system?, temperature?, tools?, ... }',
            ),
        }),
      )
      .min(1)
      .describe('Requests to enqueue (1-10,000)'),
  }),
  execute: async ({ anthropicApiKey, requests }) => {
    if (!Array.isArray(requests) || requests.length === 0) {
      return { error: 'requests must be a non-empty array.' };
    }

    const result = await anthropicRequest(anthropicApiKey, '/v1/messages/batches', {
      method: 'POST',
      body: { requests: requests.map(normalizeRequest) },
    });
    if (result.error) return result;

    return result.data;
  },
});
