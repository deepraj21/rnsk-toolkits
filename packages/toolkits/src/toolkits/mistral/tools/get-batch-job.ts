// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralGetBatchJob = tool({
  description:
    'Gets one batch job by id: status, progress (completed/total requests), errors, and output/error file ids. Set inline=true to also embed the job’s results in the response (large jobs may be huge — default false returns file ids instead).',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    jobId: z
      .string()
      .min(1)
      .describe('Batch job id from mistralCreateBatchJob / mistralListBatchJobs'),
    inline: z
      .boolean()
      .optional()
      .describe(
        'Embed results inline in the response instead of returning file ids (default false)',
      ),
  }),
  execute: async ({ mistralToken, jobId, inline }) => {
    if (!jobId) return { error: 'jobId is required.' };

    const result = await mistralRequest(mistralToken, `/batch/jobs/${encodeURIComponent(jobId)}`, {
      query: { inline },
    });
    if (result.error) return result;

    return result.data;
  },
});
