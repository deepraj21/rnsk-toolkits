// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxCopyFile = tool({
  description:
    'Copies a Dropbox file or folder (from_path → to_path) and returns the new item’s metadata. Folders are copied with all their contents. Use autorename to resolve destination conflicts.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
    fromPath: z.string().min(1).describe('Path of the file/folder to copy'),
    toPath: z.string().min(1).describe('Destination path, including the new name'),
    autorename: z.boolean().optional().describe('Auto-rename on conflict (default false)'),
  }),
  execute: async ({ dropboxToken, fromPath, toPath, autorename }) => {
    if (!fromPath) return { error: 'fromPath is required.' };
    if (!toPath) return { error: 'toPath is required.' };

    const result = await dropboxRpc(dropboxToken, '/files/copy_v2', {
      from_path: fromPath,
      to_path: toPath,
      autorename,
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return data.metadata ?? data;
  },
});
