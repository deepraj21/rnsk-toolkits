// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralGetModel = tool({
  description:
    'Gets the details of a single Mistral model by ID — capabilities, context window, name, and owner. Use mistralListModels to discover valid IDs first.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    model: z.string().min(1).describe('Model ID, e.g. "mistral-small-latest"'),
  }),
  execute: async ({ mistralToken, model }) => {
    if (!model) return { error: 'model is required.' };

    const result = await mistralRequest(mistralToken, `/models/${encodeURIComponent(model)}`);
    if (result.error) return result;

    return result.data;
  },
});
