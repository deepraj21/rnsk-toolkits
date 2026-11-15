// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicGetModel = tool({
  description:
    'Fetches details for a single Claude model by ID: display name, capabilities, and lifecycle state.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    modelId: z.string().describe('Model ID, e.g. "claude-opus-5-5"'),
  }),
  execute: async ({ anthropicApiKey, modelId }) => {
    if (!modelId) return { error: 'modelId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/models/${encodeURIComponent(modelId)}`,
    );
    if (result.error) return result;

    return result.data;
  },
});
