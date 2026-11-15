// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

export const mistralFimCompletion = tool({
  description:
    'Fill-in-the-middle (FIM) code completion: given a code prefix (and optional suffix), returns the code that fits between them. Use for IDE-style completion with codestral — provide prompt as the code before the cursor and suffix as the code after it.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    model: z.string().describe('FIM-capable model ID, e.g. "codestral-latest", "codestral-2508"'),
    prompt: z.string().min(1).describe('Code before the completion point'),
    suffix: z.string().optional().describe('Code after the completion point (FIM middle fill)'),
    temperature: z.number().min(0).max(2).optional().describe('Sampling temperature (0-2)'),
    topP: z.number().min(0).max(1).optional().describe('Nucleus sampling cutoff (0-1)'),
    maxTokens: z.number().min(0).optional().describe('Max tokens to generate'),
    minTokens: z.number().min(0).optional().describe('Minimum tokens to generate'),
    stop: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe('Stop token(s) that end generation'),
    randomSeed: z.number().optional().describe('Fixed seed for reproducible output'),
    metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata'),
  }),
  execute: async ({
    mistralToken,
    model,
    prompt,
    suffix,
    temperature,
    topP,
    maxTokens,
    minTokens,
    stop,
    randomSeed,
    metadata,
  }) => {
    if (!model) return { error: 'model is required.' };
    if (!prompt) return { error: 'prompt is required.' };

    const result = await mistralRequest(mistralToken, '/fim/completions', {
      method: 'POST',
      body: compact({
        model,
        prompt,
        suffix,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        min_tokens: minTokens,
        stop,
        random_seed: randomSeed,
        metadata,
      }),
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      id: data.id,
      model: data.model,
      choices: data.choices,
      usage: data.usage,
    };
  },
});
