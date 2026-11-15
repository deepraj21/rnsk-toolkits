// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

export const mistralCreateEmbeddings = tool({
  description:
    'Converts text into embedding vectors with a Mistral embedding model (e.g. "mistral-embed"). Accepts one string or an array of strings; returns one vector per input. Use for semantic search, clustering, and similarity.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    model: z.string().describe('Embedding model ID, e.g. "mistral-embed"'),
    input: z
      .union([z.string(), z.array(z.string()).min(1)])
      .describe('Text to embed — a single string or an array of strings'),
    outputDimension: z
      .number()
      .min(1)
      .optional()
      .describe('Requested output dimension when the model supports it'),
    outputDtype: z
      .string()
      .optional()
      .describe('Output data type when supported (e.g. "float", "int8")'),
    encodingFormat: z
      .enum(['float', 'base64'])
      .optional()
      .describe('Encoding of the returned vectors (default "float")'),
    metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata'),
  }),
  execute: async ({
    mistralToken,
    model,
    input,
    outputDimension,
    outputDtype,
    encodingFormat,
    metadata,
  }) => {
    if (!model) return { error: 'model is required.' };
    if (input === undefined || input === null || input === '')
      return { error: 'input is required.' };

    const result = await mistralRequest(mistralToken, '/embeddings', {
      method: 'POST',
      body: compact({
        model,
        input,
        output_dimension: outputDimension,
        output_dtype: outputDtype,
        encoding_format: encodingFormat,
        metadata,
      }),
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      object: data.object,
      data: data.data,
      model: data.model,
      usage: data.usage,
    };
  },
});
