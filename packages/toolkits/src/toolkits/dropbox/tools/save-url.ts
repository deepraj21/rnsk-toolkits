// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxSaveUrl = tool({
  description:
    'Saves the contents of a public URL into a Dropbox file at the given path (like "download this URL into my Dropbox"). Returns complete immediately for small URLs, or an async job id for larger ones — poll with dropboxCheckSaveUrlStatus. The transfer must finish within 15 minutes or the job fails.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z
      .string()
      .min(1)
      .describe('Destination path including filename, e.g. "/Downloads/report.pdf"'),
    url: z.string().url().describe('Public http/https URL to download'),
  }),
  execute: async ({ dropboxToken, path, url }) => {
    if (!path) return { error: 'path is required.' };
    if (!url) return { error: 'url is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/save_url', { path, url });
    if (result.error) return result;

    const data = result.data ?? {};
    if (data['.tag'] === 'async_job_id' || data.async_job_id) {
      return {
        status: 'in_progress',
        asyncJobId: data.async_job_id,
        note: 'Dropbox is still downloading the URL. Poll with dropboxCheckSaveUrlStatus using this asyncJobId.',
      };
    }
    const metadata = data['.tag'] === 'complete' && data.complete ? data.complete : data;
    return { status: 'complete', metadata };
  },
});
