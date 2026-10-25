// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');

export const openaiCreateEmbedding = tool({
  description:
    'Convert text into a numeric embedding vector for semantic search, clustering, or similarity. Send one string or a batch of strings in one call.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    model: z
      .string()
      .describe(
        'Embedding model: text-embedding-3-small (default), text-embedding-3-large, or text-embedding-ada-002',
      ),
    input: z
      .union([z.string(), z.array(z.string())])
      .describe('Text to embed — a single string or an array of strings (max 8192 tokens each)'),
    dimensions: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Shorten the vector to N dimensions (text-embedding-3 models only)'),
    encodingFormat: z
      .enum(['float', 'base64'])
      .optional()
      .describe('Vector encoding: float (default) or base64'),
    user: z.string().optional().describe('End-user identifier for abuse monitoring'),
  }),
  execute: async ({ openaiApiKey, model, input, dimensions, encodingFormat, user }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/embeddings', {
        method: 'POST',
        body: {
          model,
          input,
          ...(dimensions !== undefined ? { dimensions } : {}),
          ...(encodingFormat ? { encoding_format: encodingFormat } : {}),
          ...(user ? { user } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create embeddings', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error creating embeddings');
    }
  },
});
