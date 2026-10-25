// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');

export const openaiCreateModeration = tool({
  description:
    'Classify text (or an image URL) for harmful content: hate, harassment, violence, self-harm, sexual, and illicit categories with per-category flags. Use to pre-screen user input before it reaches a model.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    input: z
      .union([z.string(), z.array(z.string()), z.array(z.record(z.any()))])
      .describe(
        'Text to check, an array of texts, or multimodal items like {type:"text", text} / {type:"image_url", image_url:{url}}',
      ),
    model: z
      .string()
      .optional()
      .describe(
        'Moderation model: omni-moderation-latest (default), text-moderation-latest, text-moderation-stable',
      ),
  }),
  execute: async ({ openaiApiKey, input, model }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/moderations', {
        method: 'POST',
        body: { input, ...(model ? { model } : {}) },
      });
      if (!result.ok) return failedResult('Failed to run moderation', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error running moderation');
    }
  },
});
