// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxGetTemporaryLink = tool({
  description:
    'Gets a short-lived temporary download URL for a Dropbox file (plus its metadata). Use this for large files that should be fetched directly rather than inlined through dropboxDownloadFile. The link expires after about 4 hours.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z.string().min(1).describe('File path or "id:..." file id'),
  }),
  execute: async ({ dropboxToken, path }) => {
    if (!path) return { error: 'path is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/get_temporary_link', { path });
    if (result.error) return result;

    const data = result.data ?? {};
    return { link: data.link, metadata: data.metadata };
  },
});
