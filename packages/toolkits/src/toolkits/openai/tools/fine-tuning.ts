// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');
const jobIdField = z
  .string()
  .describe('Fine-tuning job ID (ftjob_...) — get it from openaiListFineTuningJobs');

export const openaiCreateFineTuningJob = tool({
  description:
    'Start a fine-tuning job on an uploaded training file (JSONL). Returns a job you poll with openaiGetFineTuningJob; the resulting model ID appears when status is succeeded.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    model: z
      .string()
      .describe('Base model to fine-tune, e.g. gpt-4.1-mini, gpt-4.1, gpt-4o-mini, o4-mini'),
    trainingFile: z.string().describe('File ID of the training data (purpose: fine-tune)'),
    validationFile: z.string().optional().describe('File ID of the validation data'),
    suffix: z
      .string()
      .max(40)
      .optional()
      .describe(
        'Custom name suffix for the resulting model ID (letters, numbers, hyphens; max 40 chars)',
      ),
    hyperparameters: z
      .record(z.any())
      .optional()
      .describe('e.g. {n_epochs: 3} or {batch_size: 8, learning_rate_multiplier: 2}'),
    seed: z.number().optional().describe('Seed for reproducible job initialization'),
    metadata: z.record(z.any()).optional().describe('Key/value metadata stored with the job'),
  }),
  execute: async ({
    openaiApiKey,
    model,
    trainingFile,
    validationFile,
    suffix,
    hyperparameters,
    seed,
    metadata,
  }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/fine_tuning/jobs', {
        method: 'POST',
        body: {
          model,
          training_file: trainingFile,
          ...(validationFile ? { validation_file: validationFile } : {}),
          ...(suffix ? { suffix } : {}),
          ...(hyperparameters ? { hyperparameters } : {}),
          ...(seed !== undefined ? { seed } : {}),
          ...(metadata ? { metadata } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create fine-tuning job', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error creating fine-tuning job');
    }
  },
});

export const openaiListFineTuningJobs = tool({
  description:
    'List fine-tuning jobs with their statuses (validating_files, running, succeeded, failed, cancelled) and page through results.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    after: z.string().optional().describe('Cursor for paging — pass the previous last value'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Jobs per page (default 20, max 100)'),
  }),
  execute: async ({ openaiApiKey, after, limit }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/fine_tuning/jobs', {
        query: { after, limit },
      });
      if (!result.ok) return failedResult('Failed to list fine-tuning jobs', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error listing fine-tuning jobs');
    }
  },
});

export const openaiGetFineTuningJob = tool({
  description:
    'Get one fine-tuning job: status, trained tokens, result files, error details, and the fine-tuned model ID once it succeeds.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    jobId: jobIdField,
  }),
  execute: async ({ openaiApiKey, jobId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/fine_tuning/jobs/${jobId}`);
      if (!result.ok) return failedResult('Failed to get fine-tuning job', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error getting fine-tuning job');
    }
  },
});

export const openaiListFineTuningEvents = tool({
  description:
    'List the event log of a fine-tuning job (progress, metrics, errors) — the best way to see why a job is slow or failing.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    jobId: jobIdField,
    after: z.string().optional().describe('Cursor for paging — pass the previous last value'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Events per page (default 20, max 100)'),
  }),
  execute: async ({ openaiApiKey, jobId, after, limit }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/fine_tuning/jobs/${jobId}/events`, {
        query: { after, limit },
      });
      if (!result.ok) return failedResult('Failed to list fine-tuning events', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error listing fine-tuning events');
    }
  },
});

export const openaiCancelFineTuningJob = tool({
  description: 'Cancel a queued or running fine-tuning job so it stops consuming training budget.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    jobId: jobIdField,
  }),
  execute: async ({ openaiApiKey, jobId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/fine_tuning/jobs/${jobId}/cancel`, {
        method: 'POST',
        body: {},
      });
      if (!result.ok) return failedResult('Failed to cancel fine-tuning job', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error cancelling fine-tuning job');
    }
  },
});

export const openaiPauseFineTuningJob = tool({
  description:
    'Pause a running fine-tuning job; it can be resumed later with openaiResumeFineTuningJob.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    jobId: jobIdField,
  }),
  execute: async ({ openaiApiKey, jobId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/fine_tuning/jobs/${jobId}/pause`, {
        method: 'POST',
        body: {},
      });
      if (!result.ok) return failedResult('Failed to pause fine-tuning job', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error pausing fine-tuning job');
    }
  },
});

export const openaiResumeFineTuningJob = tool({
  description: 'Resume a paused fine-tuning job from where it left off.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    jobId: jobIdField,
  }),
  execute: async ({ openaiApiKey, jobId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/fine_tuning/jobs/${jobId}/resume`, {
        method: 'POST',
        body: {},
      });
      if (!result.ok) return failedResult('Failed to resume fine-tuning job', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error resuming fine-tuning job');
    }
  },
});
