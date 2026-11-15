// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxCheckSaveUrlStatus = tool({
  description:
    'Checks the status of a dropboxSaveUrl job. The result’s .tag is "in_progress", "complete" (with the created file’s metadata), or "failed" (with the error).',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    asyncJobId: z.string().min(1).describe('asyncJobId returned by dropboxSaveUrl'),
  }),
  execute: async ({ dropboxToken, asyncJobId }) => {
    if (!asyncJobId) return { error: 'asyncJobId is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/save_url/check_job_status', {
      async_job_id: asyncJobId,
    });
    if (result.error) return result;

    return result.data;
  },
});
