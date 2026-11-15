// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralListModels = tool({
  description:
    'Lists the Mistral models available to the connected account — model IDs, capabilities, context window, and owned_by. Use the returned IDs with chatCompletion, fimCompletion, createEmbeddings, and the other model-driven tools.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    provider: z.string().optional().describe('Filter by model provider/owner'),
    model: z.string().optional().describe('Filter by exact model ID'),
  }),
  execute: async ({ mistralToken, provider, model }) => {
    const result = await mistralRequest(mistralToken, '/models', {
      query: { provider, model },
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      object: data.object,
      data: Array.isArray(data.data) ? data.data : [],
    };
  },
});
