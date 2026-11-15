// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralCancelBatchJob = tool({
  description:
    'Requests cancellation of a queued or running batch job. The job moves to CANCELLATION_REQUESTED and then CANCELLED; already-completed requests are not undone. Check the result with mistralGetBatchJob.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    jobId: z.string().min(1).describe('Batch job id to cancel'),
  }),
  execute: async ({ mistralToken, jobId }) => {
    if (!jobId) return { error: 'jobId is required.' };

    const result = await mistralRequest(
      mistralToken,
      `/batch/jobs/${encodeURIComponent(jobId)}/cancel`,
      {
        method: 'POST',
      },
    );
    if (result.error) return result;

    return result.data;
  },
});
