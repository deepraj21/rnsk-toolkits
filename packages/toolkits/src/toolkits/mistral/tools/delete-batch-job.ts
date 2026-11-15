// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralDeleteBatchJob = tool({
  description:
    'Deletes a batch job and its stored inputs/outputs. This is permanent — download or read the output files first with mistralGetFileContent / mistralGetFileUrl if you need the results.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    jobId: z.string().min(1).describe('Batch job id to delete'),
  }),
  execute: async ({ mistralToken, jobId }) => {
    if (!jobId) return { error: 'jobId is required.' };

    const result = await mistralRequest(mistralToken, `/batch/jobs/${encodeURIComponent(jobId)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return { deleted: true, jobId, result: result.data ?? null };
  },
});
