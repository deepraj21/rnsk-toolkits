// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetAssetUploadJob = tool({
  description:
    'Checks an asset upload job started with canvaCreateAssetUploadJob. On success returns the asset (id, name, tags, thumbnail); on failure returns the error code (file_too_big, import_failed, fetch_failed). Job status is in_progress until processing finishes — poll until success or failed.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    jobId: z.string().min(1).describe('Asset upload job ID returned when the job was created'),
  }),
  execute: async ({ canvaToken, jobId }) => {
    if (!jobId) return { error: 'jobId is required.' };

    const result = await canvaRequest(canvaToken, `/asset-uploads/${encodeURIComponent(jobId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
