// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetImageGenerationJob = tool({
  description:
    'Checks an image generation job started with canvaCreateImageGenerationJob. On success returns the image: a download URL (valid 24 hours) and, if asset_upload was "upload", the saved asset. Poll until status is success or failed.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    jobId: z.string().min(1).describe('Image generation job ID returned when the job was created'),
  }),
  execute: async ({ canvaToken, jobId }) => {
    if (!jobId) return { error: 'jobId is required.' };

    const result = await canvaRequest(
      canvaToken,
      `/image-generations/${encodeURIComponent(jobId)}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
