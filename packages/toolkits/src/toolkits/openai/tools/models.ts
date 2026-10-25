// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');

export const openaiListModels = tool({
  description:
    'List the models available to the connected API key (including fine-tuned models). Use to discover exact model IDs before calling inference tools.',
  inputSchema: z.object({ openaiApiKey: keyField }),
  execute: async ({ openaiApiKey }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/models');
      if (!result.ok) return failedResult('Failed to list models', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error listing models');
    }
  },
});

export const openaiGetModel = tool({
  description:
    'Retrieve one model by ID: owner, display name, creation date, and the modalities/capabilities it supports.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    model: z.string().describe('Model ID, e.g. gpt-4.1 or ft:gpt-4.1:org:suffix:id'),
  }),
  execute: async ({ openaiApiKey, model }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/models/${model}`);
      if (!result.ok) return failedResult('Failed to get model', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error getting model');
    }
  },
});

export const openaiDeleteModel = tool({
  description:
    'Delete a fine-tuned model permanently. Base models cannot be deleted; the API returns an error for them.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    model: z.string().describe('Fine-tuned model ID to delete, e.g. ft:gpt-4.1:org:suffix:id'),
  }),
  execute: async ({ openaiApiKey, model }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/models/${model}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete model', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error deleting model');
    }
  },
});
