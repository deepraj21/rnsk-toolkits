// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

export const mistralModerateText = tool({
  description:
    'Classifies text for moderation flags (sexual, hate_and_discrimination, violence, self_harm, etc.) using Mistral’s moderation model. Accepts one string or an array of strings; returns a categories + scores result per input.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    input: z
      .union([z.string(), z.array(z.string()).min(1)])
      .describe('Text to moderate — a single string or an array of strings'),
    model: z
      .string()
      .optional()
      .describe('Moderation model ID (defaults to "mistral-moderation-latest")'),
    metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata'),
  }),
  execute: async ({ mistralToken, input, model, metadata }) => {
    if (input === undefined || input === null || input === '')
      return { error: 'input is required.' };

    const result = await mistralRequest(mistralToken, '/moderations', {
      method: 'POST',
      body: compact({
        model: model ?? 'mistral-moderation-latest',
        input,
        metadata,
      }),
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      id: data.id,
      model: data.model,
      results: data.results,
    };
  },
});
