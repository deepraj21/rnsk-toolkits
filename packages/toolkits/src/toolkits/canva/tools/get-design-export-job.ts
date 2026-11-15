// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetDesignExportJob = tool({
  description:
    'Checks an export job started with canvaCreateDesignExportJob. On success returns download URLs (one per exported page); URLs expire after 24 hours. Job status is in_progress until Canva finishes — poll until success or failed.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    exportId: z.string().min(1).describe('Export job ID returned when the job was created'),
  }),
  execute: async ({ canvaToken, exportId }) => {
    if (!exportId) return { error: 'exportId is required.' };

    const result = await canvaRequest(canvaToken, `/exports/${encodeURIComponent(exportId)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});
