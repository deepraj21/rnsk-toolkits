// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetUrlImportJob = tool({
  description:
    'Checks a URL design import job started with canvaCreateUrlImportJob. On success returns the imported design (id, title, URLs); on failure returns the error. Poll until status is success or failed.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    jobId: z.string().min(1).describe('URL import job ID returned when the job was created'),
  }),
  execute: async ({ canvaToken, jobId }) => {
    if (!jobId) return { error: 'jobId is required.' };

    const result = await canvaRequest(canvaToken, `/url-imports/${encodeURIComponent(jobId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
