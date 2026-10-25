// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');
const batchIdField = z.string().describe('Batch ID (batch_...) — get it from openaiListBatches');

export const openaiCreateBatch = tool({
  description:
    'Submit a batch of requests for asynchronous, lower-cost processing. Provide a JSONL file (one API request per line, uploaded with purpose "batch") and the endpoint those requests target (e.g. /v1/responses).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    endpoint: z
      .string()
      .describe(
        'API endpoint the batched requests target, e.g. /v1/responses or /v1/chat/completions',
      ),
    inputFileId: z.string().describe('ID of the uploaded JSONL input file (purpose: batch)'),
    completionWindow: z
      .enum(['24h'])
      .optional()
      .describe('Processing window — currently only 24h (default)'),
    metadata: z.record(z.any()).optional().describe('Key/value metadata stored with the batch'),
  }),
  execute: async ({ openaiApiKey, endpoint, inputFileId, completionWindow, metadata }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/batches', {
        method: 'POST',
        body: {
          endpoint,
          input_file_id: inputFileId,
          ...(completionWindow ? { completion_window: completionWindow } : {}),
          ...(metadata ? { metadata } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create batch', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error creating batch');
    }
  },
});

export const openaiGetBatch = tool({
  description:
    'Get a batch by ID: status (validating, in_progress, completed, failed, expired), request counts, output file IDs, and error counts.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    batchId: batchIdField,
  }),
  execute: async ({ openaiApiKey, batchId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/batches/${batchId}`);
      if (!result.ok) return failedResult('Failed to get batch', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error getting batch');
    }
  },
});

export const openaiListBatches = tool({
  description:
    'List batches with their statuses; filter by endpoint and page through with the returned next cursor. Poll a batch here until it completes, then read its output file.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    endpoint: z.string().optional().describe('Only batches for this endpoint, e.g. /v1/responses'),
    after: z.string().optional().describe('Cursor for paging — pass the previous next value'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Batches per page (default 20, max 100)'),
  }),
  execute: async ({ openaiApiKey, endpoint, after, limit }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/batches', {
        query: { endpoint, after, limit },
      });
      if (!result.ok) return failedResult('Failed to list batches', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error listing batches');
    }
  },
});

export const openaiCancelBatch = tool({
  description:
    'Cancel a batch that has not finished yet; completed requests stay available, pending ones are dropped.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    batchId: batchIdField,
  }),
  execute: async ({ openaiApiKey, batchId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/batches/${batchId}/cancel`, {
        method: 'POST',
        body: {},
      });
      if (!result.ok) return failedResult('Failed to cancel batch', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error cancelling batch');
    }
  },
});
