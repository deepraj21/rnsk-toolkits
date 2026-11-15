// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetDesignAutofillJob = tool({
  description:
    'Checks an autofill job started with canvaCreateDesignAutofillJob. On success returns the created design (create modes) or the updated design (update_design mode); on failure returns the autofill error. Poll until status is success or failed.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    jobId: z.string().min(1).describe('Autofill job ID returned when the job was created'),
  }),
  execute: async ({ canvaToken, jobId }) => {
    if (!jobId) return { error: 'jobId is required.' };

    const result = await canvaRequest(canvaToken, `/autofills/${encodeURIComponent(jobId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
