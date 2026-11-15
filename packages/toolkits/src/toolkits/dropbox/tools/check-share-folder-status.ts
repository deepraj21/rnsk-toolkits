// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxCheckShareFolderStatus = tool({
  description:
    'Checks the status of a dropboxShareFolder job. The result’s .tag is "in_progress", "complete" (with the shared folder metadata), or "failed" (with the error).',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    asyncJobId: z.string().min(1).describe('asyncJobId returned by dropboxShareFolder'),
  }),
  execute: async ({ dropboxToken, asyncJobId }) => {
    if (!asyncJobId) return { error: 'asyncJobId is required.' };

    const result = await dropboxRpc(dropboxToken, '/sharing/check_share_job_status', {
      async_job_id: asyncJobId,
    });
    if (result.error) return result;

    return result.data;
  },
});
