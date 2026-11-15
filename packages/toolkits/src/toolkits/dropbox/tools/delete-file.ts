// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxDeleteFile = tool({
  description:
    'Deletes a file or folder from Dropbox (the path moves to the deleted-files state). The folder’s contents go with it. This can be undone while the entry is still recoverable — prefer dropboxRestoreFile for files with revisions, and treat folder deletion as effectively permanent.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    path: z.string().min(1).describe('Path of the file/folder to delete'),
  }),
  execute: async ({ dropboxToken, path }) => {
    if (!path) return { error: 'path is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/delete_v2', { path });
    if (result.error) return result;

    const data = result.data ?? {};
    return { deleted: true, metadata: data.metadata ?? data };
  },
});
