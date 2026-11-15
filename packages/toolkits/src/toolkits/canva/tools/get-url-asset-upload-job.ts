// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetUrlAssetUploadJob = tool({
  description:
    'Checks a URL asset upload job started with canvaCreateUrlAssetUploadJob. On success returns the asset (id, name, tags, thumbnail); on failure returns the error code. Poll until status is success or failed.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    jobId: z.string().min(1).describe('URL asset upload job ID returned when the job was created'),
  }),
  execute: async ({ canvaToken, jobId }) => {
    if (!jobId) return { error: 'jobId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/url-asset-uploads/${encodeURIComponent(jobId)}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
