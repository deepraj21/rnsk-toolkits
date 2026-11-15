// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetDesignGenerationJob = tool({
  description:
    "Checks an AI design generation job started with canvaCreateDesignGenerationJob. On success returns the generated design (saved to the user's Canva account); on failure returns the error. Poll until status is success or failed.",
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    jobId: z.string().min(1).describe('Design generation job ID returned when the job was created'),
  }),
  execute: async ({ canvaToken, jobId }) => {
    if (!jobId) return { error: 'jobId is required.' };

    const result = await canvaRequest(canvaToken, `/generations/${encodeURIComponent(jobId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
